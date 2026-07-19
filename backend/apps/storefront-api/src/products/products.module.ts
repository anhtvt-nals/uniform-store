import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity, CategoryEntity, ProductImageEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, ProductImageEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
