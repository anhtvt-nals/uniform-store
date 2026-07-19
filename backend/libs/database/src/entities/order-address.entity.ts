import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_addresses')
export class OrderAddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ name: 'full_name', type: 'varchar', default: '' })
  fullName: string;

  @Column({ type: 'varchar', default: '' })
  company: string;

  @Column({ name: 'street_line1', type: 'varchar', default: '' })
  streetLine1: string;

  @Column({ name: 'street_line2', type: 'varchar', default: '' })
  streetLine2: string;

  @Column({ type: 'varchar', default: '' })
  city: string;

  @Column({ type: 'varchar', default: '' })
  province: string;

  @Column({ name: 'postal_code', type: 'varchar', default: '' })
  postalCode: string;

  @Column({ name: 'country_code', type: 'varchar', default: 'VN' })
  countryCode: string;

  @Column({ type: 'varchar', default: '' })
  phone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => OrderEntity, (o) => o.addresses)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
