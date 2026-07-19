import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_discounts')
export class OrderDiscountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'coupon_code', type: 'varchar', default: '' })
  couponCode: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'decimal', default: 0 })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => OrderEntity, (o) => o.discounts)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
