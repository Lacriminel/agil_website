import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Place } from './place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly repo: Repository<Place>,
  ) {}

  findAll(filters?: { governorateId?: number; unassigned?: boolean }) {
    const where: any = {};
    if (filters?.governorateId) where.governorateId = filters.governorateId;
    if (filters?.unassigned) where.customerId = IsNull();
    return this.repo.find({ where, relations: ['governorate', 'governorate.governorateGroup'] });
  }

  async findById(id: number) {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['governorate', 'governorate.governorateGroup'],
    });
    if (!p) throw new NotFoundException('Place not found');
    return p;
  }

  async create(name: string, governorateId: number) {
    return this.repo.save({ name, governorateId, customerId: null });
  }

  async update(id: number, data: Partial<{ name: string; governorateId: number }>) {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    const place = await this.findById(id);
    if (place.customerId !== null) {
      throw new ConflictException('Cannot delete a place linked to a customer');
    }
    await this.repo.delete(id);
    return { deleted: true };
  }

  async setCustomer(placeId: number, customerId: number | null) {
    await this.repo.update(placeId, { customerId });
  }

  async checkAvailable(placeId: number) {
    const place = await this.findById(placeId);
    if (place.customerId !== null) {
      throw new ConflictException('Place is already assigned to another customer');
    }
    return place;
  }
}
