import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariantEntity } from './product-variant.entity';

@Entity('inventory')
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid', unique: true })
  variantId: string;

  @OneToOne(() => ProductVariantEntity)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reserved: number;

  @Column({ name: 'low_stock_level', type: 'int', default: 5 })
  lowStockLevel: number;

  @Column({ name: 'track_inventory', type: 'boolean', default: true })
  trackInventory: boolean;

  @Column({ name: 'allow_backorder', type: 'boolean', default: false })
  allowBackorder: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
