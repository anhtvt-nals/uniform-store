import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  ProductVariantEntity,
  InventoryEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      CartCouponEntity,
      ProductVariantEntity,
      InventoryEntity,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
