import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('stock_history')
export class StockHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'reason_code', type: 'varchar', length: 50, nullable: true })
  reasonCode?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'quantity_change', type: 'int' })
  quantityChange: number;

  @Column({ name: 'quantity_before', type: 'int' })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'int' })
  quantityAfter: number;

  @Column({ name: 'reserved_before', type: 'int', default: 0 })
  reservedBefore: number;

  @Column({ name: 'reserved_after', type: 'int', default: 0 })
  reservedAfter: number;

  @Column({ type: 'text', nullable: true })
  reference?: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
