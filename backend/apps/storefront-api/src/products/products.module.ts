import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity, CategoryEntity, ProductImageEntity, ProductVariantEntity, DiscountEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, ProductImageEntity, ProductVariantEntity, DiscountEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
