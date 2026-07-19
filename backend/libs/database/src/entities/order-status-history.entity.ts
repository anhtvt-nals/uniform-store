import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'from_status', type: 'varchar', nullable: true })
  fromStatus?: string;

  @Column({ name: 'to_status', type: 'varchar' })
  toStatus: string;

  @Column({ type: 'varchar', nullable: true })
  note?: string;

  @Column({ name: 'performed_by', type: 'varchar', nullable: true })
  performedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => OrderEntity, (o) => o.statusHistory)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
