import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';
import { User } from '../users/user.entity';
import { Place } from '../places/place.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.customerRepo.find({
      relations: ['user', 'place', 'place.governorate', 'place.governorate.governorateGroup'],
    });
  }

  async findById(id: number) {
    const c = await this.customerRepo.findOne({
      where: { id },
      relations: ['user', 'place', 'place.governorate', 'place.governorate.governorateGroup'],
    });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async findByUserId(userId: number) {
    const c = await this.customerRepo.findOne({
      where: { userId },
      relations: ['user', 'place', 'place.governorate', 'place.governorate.governorateGroup'],
    });
    if (!c) throw new NotFoundException('Customer profile not found');
    return c;
  }

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    placeId: number;
  }) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const existingUser = await qr.manager.findOne(User, { where: { email: data.email } });
      if (existingUser) throw new ConflictException('Email already in use');

      const place = await qr.manager.findOne(Place, { where: { id: data.placeId } });
      if (!place) throw new NotFoundException('Place not found');
      if (place.customerId !== null) throw new ConflictException('Place already assigned');

      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await qr.manager.save(User, {
        email: data.email,
        passwordHash,
        role: UserRole.CUSTOMER,
      });

      const customer = await qr.manager.save(Customer, {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        placeId: data.placeId,
      });

      await qr.manager.update(Place, data.placeId, { customerId: customer.id });

      await qr.commitTransaction();
      return this.findById(customer.id);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async update(id: number, data: Partial<{ fullName: string; phone: string; email: string }>) {
    const customer = await this.findById(id);
    if (data.email) {
      await this.userRepo.update(customer.userId, { email: data.email });
    }
    const { email, ...customerData } = data;
    if (Object.keys(customerData).length) {
      await this.customerRepo.update(id, customerData);
    }
    return this.findById(id);
  }

  async delete(id: number) {
    const customer = await this.findById(id);
    await this.placeRepo.update(customer.placeId, { customerId: null });
    await this.userRepo.delete(customer.userId);
    return { deleted: true };
  }
}
