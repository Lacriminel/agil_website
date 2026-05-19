import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Compartment } from '../trucks/compartment.entity';
import { GasType } from '../common/enums';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'compartment_id' })
  compartmentId: number;

  @Column({ name: 'gas_type', type: 'enum', enum: GasType })
  gasType: GasType;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, o => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Compartment, { eager: true })
  @JoinColumn({ name: 'compartment_id' })
  compartment: Compartment;
}
