import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernorateGroup } from './governorate-group.entity';
import { Governorate } from './governorate.entity';

@Injectable()
export class GovernoratesService {
  constructor(
    @InjectRepository(GovernorateGroup)
    private readonly groupRepo: Repository<GovernorateGroup>,
    @InjectRepository(Governorate)
    private readonly govRepo: Repository<Governorate>,
  ) {}

  findAllGroups() {
    return this.groupRepo.find({ relations: ['governorates'] });
  }

  async findGroupById(id: number) {
    const g = await this.groupRepo.findOne({ where: { id }, relations: ['governorates'] });
    if (!g) throw new NotFoundException('Governorate group not found');
    return g;
  }

  createGroup(name: string) {
    return this.groupRepo.save({ name });
  }

  async updateGroup(id: number, name: string) {
    await this.findGroupById(id);
    await this.groupRepo.update(id, { name });
    return this.findGroupById(id);
  }

  async deleteGroup(id: number) {
    await this.findGroupById(id);
    await this.groupRepo.delete(id);
    return { deleted: true };
  }

  findAllGovernorates() {
    return this.govRepo.find({ relations: ['governorateGroup'] });
  }

  async findGovernorateById(id: number) {
    const g = await this.govRepo.findOne({ where: { id }, relations: ['governorateGroup'] });
    if (!g) throw new NotFoundException('Governorate not found');
    return g;
  }

  async createGovernorate(name: string, governorateGroupId: number) {
    await this.findGroupById(governorateGroupId);
    return this.govRepo.save({ name, governorateGroupId });
  }

  async updateGovernorate(id: number, data: Partial<{ name: string; governorateGroupId: number }>) {
    await this.findGovernorateById(id);
    if (data.governorateGroupId) await this.findGroupById(data.governorateGroupId);
    await this.govRepo.update(id, data);
    return this.findGovernorateById(id);
  }

  async deleteGovernorate(id: number) {
    await this.findGovernorateById(id);
    await this.govRepo.delete(id);
    return { deleted: true };
  }
}
