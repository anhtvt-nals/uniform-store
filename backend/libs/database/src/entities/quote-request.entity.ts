import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quote_requests')
export class QuoteRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_name', type: 'varchar' })
  customerName: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', default: '' })
  email: string;

  @Column({ type: 'varchar', default: '' })
  region: string;

  @Column({ type: 'text', default: '' })
  address: string;

  @Column({ name: 'product_type', type: 'text', default: '' })
  productType: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', default: 'NEW' })
  status: string;

  @Column({ name: 'sales_note', type: 'text', default: '' })
  salesNote: string;

  @Column({ type: 'varchar', default: '' })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
