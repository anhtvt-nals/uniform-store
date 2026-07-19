import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { OrderAddressEntity } from './order-address.entity';
import { OrderPaymentEntity } from './order-payment.entity';
import { OrderDiscountEntity } from './order-discount.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', default: '' })
  email: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'currency_code', type: 'varchar', default: 'VND' })
  currencyCode: string;

  @Column({ type: 'decimal', default: 0 })
  subtotal: number;

  @Column({ name: 'discount_total', type: 'decimal', default: 0 })
  discountTotal: number;

  @Column({ name: 'shipping_total', type: 'decimal', default: 0 })
  shippingTotal: number;

  @Column({ name: 'tax_total', type: 'decimal', default: 0 })
  taxTotal: number;

  @Column({ name: 'grand_total', type: 'decimal', default: 0 })
  grandTotal: number;

  @Column({ name: 'shipping_method', type: 'varchar', default: '' })
  shippingMethod: string;

  @Column({ name: 'payment_method', type: 'varchar', default: '' })
  paymentMethod: string;

  @Column({ type: 'varchar', default: '' })
  notes: string;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', default: '' })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => OrderItemEntity, (i) => i.order)
  items: OrderItemEntity[];

  @OneToMany(() => OrderAddressEntity, (a) => a.order)
  addresses: OrderAddressEntity[];

  @OneToMany(() => OrderPaymentEntity, (p) => p.order)
  payments: OrderPaymentEntity[];

  @OneToMany(() => OrderDiscountEntity, (d) => d.order)
  discounts: OrderDiscountEntity[];

  @OneToMany(() => OrderStatusHistoryEntity, (h) => h.order)
  statusHistory: OrderStatusHistoryEntity[];
}
