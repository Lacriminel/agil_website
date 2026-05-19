import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Governorate } from './governorate.entity';

@Entity('governorate_groups')
export class GovernorateGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  name: string;

  @OneToMany(() => Governorate, g => g.governorateGroup)
  governorates: Governorate[];
}
