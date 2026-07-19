import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOptionGroupEntity } from './product-option-group.entity';

@Entity('product_options')
export class ProductOptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  value: Record<string, string>;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProductOptionGroupEntity, (g) => g.options)
  @JoinColumn({ name: 'group_id' })
  group?: ProductOptionGroupEntity;
}
