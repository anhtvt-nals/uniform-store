import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {
  InventoryEntity,
  StockHistoryEntity,
  ProductVariantEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryEntity,
      StockHistoryEntity,
      ProductVariantEntity,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
