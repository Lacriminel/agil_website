import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Truck } from './truck.entity';
import { Compartment } from './compartment.entity';
import { TrucksService } from './trucks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Truck, Compartment])],
  providers: [TrucksService],
  exports: [TrucksService, TypeOrmModule],
})
export class TrucksModule {}
