import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { GovernorateGroup } from '../governorates/governorate-group.entity';
import { Compartment } from './compartment.entity';
import { TruckStatus } from '../common/enums';

@Entity('trucks')
export class Truck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 40 })
  name: string;

  @Column({ name: 'governorate_group_id' })
  governorateGroupId: number;

  @Column({ type: 'enum', enum: TruckStatus, default: TruckStatus.AVAILABLE })
  status: TruckStatus;

  @Column({ name: 'total_capacity' })
  totalCapacity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => GovernorateGroup, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'governorate_group_id' })
  governorateGroup: GovernorateGroup;

  @OneToMany(() => Compartment, c => c.truck, { cascade: true, eager: true })
  compartments: Compartment[];
}
