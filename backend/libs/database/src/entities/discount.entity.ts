import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CouponEntity } from './coupon.entity';

@Entity('discounts')
export class DiscountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'decimal' })
  value: number;

  @Column({ name: 'min_order_amount', type: 'decimal', default: 0 })
  minOrderAmount: number;

  @Column({ name: 'max_discount', type: 'decimal', default: 0 })
  maxDiscount: number;

  @Column({ type: 'varchar', default: 'order' })
  target: string;

  @Column({ name: 'target_ids', type: 'uuid', array: true, default: [] })
  targetIds: string[];

  @Column({ name: 'max_uses', type: 'int', default: 0 })
  maxUses: number;

  @Column({ name: 'current_uses', type: 'int', default: 0 })
  currentUses: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'starts_at' })
  startsAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'ends_at' })
  endsAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => CouponEntity, (c) => c.discount)
  coupons?: CouponEntity[];
}
