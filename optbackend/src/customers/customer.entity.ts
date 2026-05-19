import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Place } from '../places/place.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'full_name', length: 120 })
  fullName: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ name: 'place_id', unique: true })
  placeId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Place)
  @JoinColumn({ name: 'place_id' })
  place: Place;
}
