import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Truck } from './truck.entity';
import { Compartment } from './compartment.entity';
import { COMBOS, TruckStatus } from '../common/enums';

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private readonly truckRepo: Repository<Truck>,
    @InjectRepository(Compartment)
    private readonly compartmentRepo: Repository<Compartment>,
  ) {}

  findAll(filters?: { status?: TruckStatus; groupId?: number }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.groupId) where.governorateGroupId = filters.groupId;
    return this.truckRepo.find({
      where,
      relations: ['governorateGroup', 'governorateGroup.governorates', 'compartments'],
    });
  }

  async findById(id: number) {
    const t = await this.truckRepo.findOne({
      where: { id },
      relations: ['governorateGroup', 'governorateGroup.governorates', 'compartments'],
    });
    if (!t) throw new NotFoundException('Truck not found');
    return t;
  }

  async create(data: { name: string; governorateGroupId: number; comboKey: string }) {
    const count = await this.truckRepo.count();
    if (count >= 10) throw new BadRequestException('Maximum of 10 trucks reached');

    const combo = COMBOS[data.comboKey];
    if (!combo) throw new BadRequestException(`Invalid combo key. Valid: ${Object.keys(COMBOS).join(', ')}`);

    const totalCapacity = combo.reduce((a, b) => a + b, 0);

    const truck = await this.truckRepo.save({
      name: data.name,
      governorateGroupId: data.governorateGroupId,
      totalCapacity,
      status: TruckStatus.AVAILABLE,
    });

    const compartments = combo.map((capacity, i) => ({
      truckId: truck.id,
      position: i + 1,
      capacity,
      isAvailable: true,
      gasType: null,
    }));
    await this.compartmentRepo.save(compartments);

    return this.findById(truck.id);
  }

  async update(id: number, data: Partial<{ name: string; governorateGroupId: number; status: TruckStatus }>) {
    const truck = await this.findById(id);

    if (data.status === TruckStatus.MAINTENANCE) {
      const reserved = truck.compartments.filter(c => !c.isAvailable);
      if (reserved.length > 0) {
        console.warn(`Truck ${truck.name} set to MAINTENANCE with ${reserved.length} reserved compartments`);
      }
    }

    await this.truckRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    const activeCompartments = await this.compartmentRepo.find({
      where: { truckId: id, isAvailable: false },
    });
    if (activeCompartments.length > 0) {
      throw new ConflictException('Cannot delete truck with active orders');
    }
    await this.truckRepo.delete(id);
    return { deleted: true };
  }

  findAvailableForGroup(groupId: number) {
    return this.truckRepo.find({
      where: { governorateGroupId: groupId, status: TruckStatus.AVAILABLE },
      relations: ['governorateGroup', 'compartments'],
    });
  }
}
