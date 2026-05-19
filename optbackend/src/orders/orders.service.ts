import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Compartment } from '../trucks/compartment.entity';
import { Truck } from '../trucks/truck.entity';
import { Customer } from '../customers/customer.entity';
import { OrderStatus, TruckStatus, GasType } from '../common/enums';

interface OrderItemInput {
  compartmentId: number;
  gasType: GasType;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Compartment)
    private readonly compartmentRepo: Repository<Compartment>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(filters?: { status?: OrderStatus; customerId?: number; from?: string; to?: string }) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('o.items', 'i')
      .leftJoinAndSelect('i.compartment', 'comp')
      .leftJoinAndSelect('comp.truck', 't')
      .orderBy('o.createdAt', 'DESC');

    if (filters?.status) qb.andWhere('o.status = :status', { status: filters.status });
    if (filters?.customerId) qb.andWhere('o.customerId = :cid', { cid: filters.customerId });
    if (filters?.from) qb.andWhere('o.createdAt >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('o.createdAt <= :to', { to: filters.to });

    return qb.getMany();
  }

  async findById(id: number) {
    const o = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'customer.user', 'items', 'items.compartment', 'items.compartment.truck'],
    });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async findByIdForCustomer(id: number, customerId: number) {
    const o = await this.findById(id);
    if (o.customerId !== customerId) throw new ForbiddenException();
    return o;
  }

  async create(customerId: number, items: OrderItemInput[]) {
    if (!items || items.length === 0) throw new BadRequestException('Order must have at least one item');

    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const compartmentIds = items.map(i => i.compartmentId);

      const compartments = await qr.manager
        .createQueryBuilder(Compartment, 'c')
        .leftJoinAndSelect('c.truck', 't')
        .whereInIds(compartmentIds)
        .setLock('pessimistic_write')
        .getMany();

      if (compartments.length !== compartmentIds.length) {
        throw new NotFoundException('One or more compartments not found');
      }

      for (const comp of compartments) {
        if (!comp.isAvailable) {
          throw new ConflictException(`Compartment ${comp.id} is no longer available`);
        }
        if (comp.truck.status !== TruckStatus.AVAILABLE) {
          throw new ConflictException(`Truck ${comp.truck.name} is not available`);
        }
      }

      const compMap = new Map(compartments.map(c => [c.id, c]));
      let totalQuantity = 0;

      for (const item of items) {
        const comp = compMap.get(item.compartmentId)!;
        await qr.manager.update(Compartment, comp.id, {
          isAvailable: false,
          gasType: item.gasType,
        });
        totalQuantity += comp.capacity;
      }

      const order = await qr.manager.save(Order, {
        customerId,
        status: OrderStatus.PENDING,
        totalQuantity,
      });

      const orderItems = items.map(item => ({
        orderId: order.id,
        compartmentId: item.compartmentId,
        gasType: item.gasType,
        quantity: compMap.get(item.compartmentId)!.capacity,
      }));
      await qr.manager.save(OrderItem, orderItems);

      await qr.commitTransaction();
      return this.findById(order.id);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async confirm(id: number) {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only PENDING orders can be confirmed');
    }
    await this.orderRepo.update(id, { status: OrderStatus.CONFIRMED });
    return this.findById(id);
  }

  async deliver(id: number) {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only CONFIRMED orders can be delivered');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const item of order.items) {
        await qr.manager.update(Compartment, item.compartmentId, {
          isAvailable: true,
          gasType: null,
        });
      }
      await qr.manager.update(Order, id, { status: OrderStatus.DELIVERED });
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

    return this.findById(id);
  }

  async cancel(id: number, customerId?: number) {
    const order = await this.findById(id);
    if (customerId !== undefined && order.customerId !== customerId) {
      throw new ForbiddenException();
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only PENDING orders can be cancelled');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (const item of order.items) {
        await qr.manager.update(Compartment, item.compartmentId, {
          isAvailable: true,
          gasType: null,
        });
      }
      await qr.manager.delete(Order, id);
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

    return { deleted: true };
  }

  findByCustomer(customerId: number) {
    return this.orderRepo.find({
      where: { customerId },
      relations: ['items', 'items.compartment', 'items.compartment.truck'],
      order: { createdAt: 'DESC' },
    });
  }
}
