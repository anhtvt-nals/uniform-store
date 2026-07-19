import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity('cart_coupons')
export class CartCouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ name: 'coupon_code', type: 'varchar' })
  couponCode: string;

  @Column({ name: 'discount_amount', type: 'decimal', default: 0 })
  discountAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => CartEntity, (cart) => cart.coupons)
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;
}
