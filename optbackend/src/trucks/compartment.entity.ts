import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Truck } from './truck.entity';
import { GasType } from '../common/enums';

@Entity('compartments')
@Unique(['truckId', 'position'])
export class Compartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'truck_id' })
  truckId: number;

  @Column()
  position: number;

  @Column()
  capacity: number;

  @Column({ name: 'gas_type', type: 'enum', enum: GasType, nullable: true, default: null })
  gasType: GasType | null;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @ManyToOne(() => Truck, t => t.compartments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'truck_id' })
  truck: Truck;
}
