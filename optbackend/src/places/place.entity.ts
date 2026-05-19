import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Governorate } from '../governorates/governorate.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'governorate_id' })
  governorateId: number;

  @Column({ name: 'customer_id', type: 'int', unique: true, nullable: true, default: null })
  customerId: number | null;

  @ManyToOne(() => Governorate, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'governorate_id' })
  governorate: Governorate;
}
