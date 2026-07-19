import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  OrderEntity,
  OrderItemEntity,
  OrderAddressEntity,
  OrderPaymentEntity,
  OrderDiscountEntity,
  OrderStatusHistoryEntity,
  InventoryEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      CartCouponEntity,
      OrderEntity,
      OrderItemEntity,
      OrderAddressEntity,
      OrderPaymentEntity,
      OrderDiscountEntity,
      OrderStatusHistoryEntity,
      InventoryEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
