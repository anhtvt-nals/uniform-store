import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_payments')
export class OrderPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'decimal', default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'transaction_id', type: 'varchar', default: '' })
  transactionId: string;

  @Column({ name: 'gateway_response', type: 'jsonb', default: {} })
  gatewayResponse: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => OrderEntity, (o) => o.payments)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
