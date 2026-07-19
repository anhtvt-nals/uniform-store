import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductVariantOptionEntity } from './product-variant-option.entity';

@Entity('product_variants')
export class ProductVariantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ type: 'varchar', unique: true })
  sku: string;

  @Column({ type: 'varchar', default: '' })
  barcode: string;

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({ name: 'compare_price', nullable: true, type: 'integer' })
  comparePrice: number | null;

  @Column({ name: 'tax_rate', type: 'decimal', default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', default: 0 })
  weight: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => ProductEntity, (p) => p.variants)
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @OneToMany(() => ProductVariantOptionEntity, (vo) => vo.variant)
  variantOptions?: ProductVariantOptionEntity[];
}
