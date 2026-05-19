import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { GovernorateGroup } from './governorate-group.entity';

@Entity('governorates')
export class Governorate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  name: string;

  @Column({ name: 'governorate_group_id' })
  governorateGroupId: number;

  @ManyToOne(() => GovernorateGroup, g => g.governorates, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'governorate_group_id' })
  governorateGroup: GovernorateGroup;
}
