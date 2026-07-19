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
import { CategoryEntity } from './category.entity';
import { BrandEntity } from './brand.entity';
import { ProductVariantEntity } from './product-variant.entity';
import { ProductImageEntity } from './product-image.entity';
import { ProductOptionGroupEntity } from './product-option-group.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'jsonb', default: {} })
  description: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  detail: Record<string, string>;

  @Column({ type: 'varchar', default: '' })
  sku: string;

  @Column({ name: 'base_price', type: 'decimal', default: 0 })
  basePrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', default: 0 })
  taxRate: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', default: 0 })
  weight: number;

  @Column({ name: 'meta_title', type: 'jsonb', default: {} })
  metaTitle: Record<string, string>;

  @Column({ name: 'meta_desc', type: 'jsonb', default: {} })
  metaDesc: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @ManyToOne(() => BrandEntity)
  @JoinColumn({ name: 'brand_id' })
  brand?: BrandEntity;

  @OneToMany(() => ProductVariantEntity, (v) => v.product)
  variants?: ProductVariantEntity[];

  @OneToMany(() => ProductImageEntity, (i) => i.product)
  images?: ProductImageEntity[];

  @OneToMany(() => ProductOptionGroupEntity, (g) => g.product)
  optionGroups?: ProductOptionGroupEntity[];
}
