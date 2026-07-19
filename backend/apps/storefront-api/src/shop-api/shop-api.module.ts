import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopApiController } from './shop-api.controller';
import { ShopApiService } from './shop-api.service';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { CollectionsModule } from '../collections/collections.module';
import { CartModule } from '../cart/cart.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { OrdersModule } from '../orders/orders.module';
import { ArticlesModule } from '../articles/articles.module';
import { ProductVariantEntity, CountryEntity, AddressEntity } from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariantEntity, CountryEntity, AddressEntity]),
    AuthModule,
    ProductsModule,
    CollectionsModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    ArticlesModule,
  ],
  controllers: [ShopApiController],
  providers: [ShopApiService],
})
export class ShopApiModule {}
