import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  ProductEntity,
  ProductVariantEntity,
  ProductImageEntity,
  ProductOptionGroupEntity,
  ProductOptionEntity,
  ProductVariantOptionEntity,
  InventoryEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductVariantEntity,
      ProductImageEntity,
      ProductOptionGroupEntity,
      ProductOptionEntity,
      ProductVariantOptionEntity,
      InventoryEntity,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
