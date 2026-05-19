import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernorateGroup } from './governorate-group.entity';
import { Governorate } from './governorate.entity';
import { GovernoratesService } from './governorates.service';

@Module({
  imports: [TypeOrmModule.forFeature([GovernorateGroup, Governorate])],
  providers: [GovernoratesService],
  exports: [GovernoratesService, TypeOrmModule],
})
export class GovernoratesModule {}
