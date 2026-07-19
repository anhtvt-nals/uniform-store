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
import { DiscountEntity } from './discount.entity';
import { CouponUsageEntity } from './coupon-usage.entity';

@Entity('coupons')
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'discount_id', type: 'uuid' })
  discountId: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'max_uses', type: 'int', default: 0 })
  maxUses: number;

  @Column({ name: 'current_uses', type: 'int', default: 0 })
  currentUses: number;

  @Column({ name: 'per_user_limit', type: 'int', default: 0 })
  perUserLimit: number;

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

  @ManyToOne(() => DiscountEntity, (d) => d.coupons)
  @JoinColumn({ name: 'discount_id' })
  discount?: DiscountEntity;

  @OneToMany(() => CouponUsageEntity, (u) => u.coupon)
  usages?: CouponUsageEntity[];
}
