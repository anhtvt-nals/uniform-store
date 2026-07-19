import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {
  OrderEntity,
  OrderStatusHistoryEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderStatusHistoryEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
