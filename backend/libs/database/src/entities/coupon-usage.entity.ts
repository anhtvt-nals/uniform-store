import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CouponEntity } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'coupon_id', type: 'uuid' })
  couponId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;

  @ManyToOne(() => CouponEntity, (c) => c.usages)
  @JoinColumn({ name: 'coupon_id' })
  coupon?: CouponEntity;
}
