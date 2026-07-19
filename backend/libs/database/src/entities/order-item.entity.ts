import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'product_name', type: 'jsonb' })
  productName: Record<string, string>;

  @Column({ name: 'variant_name', type: 'jsonb' })
  variantName: Record<string, string>;

  @Column({ type: 'varchar' })
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal' })
  unitPrice: number;

  @Column({ name: 'line_price', type: 'decimal' })
  linePrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => OrderEntity, (o) => o.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
