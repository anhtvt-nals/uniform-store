import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductOptionEntity } from './product-option.entity';

@Entity('product_option_groups')
export class ProductOptionGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProductEntity, (p) => p.optionGroups)
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @OneToMany(() => ProductOptionEntity, (o) => o.group)
  options?: ProductOptionEntity[];
}
