import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@app/database';
import { SharedModule } from '@app/shared';
import { CommonModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { BrandsModule } from './brands/brands.module';
import { SearchModule } from './search/search.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { AccountModule } from './account/account.module';
import { ArticlesModule } from './articles/articles.module';
import { PagesModule } from './pages/pages.module';
import { ShopApiModule } from './shop-api/shop-api.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    DatabaseModule,
    SharedModule,
    CommonModule,
    AuthModule,
    ProductsModule,
    CollectionsModule,
    BrandsModule,
    SearchModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    AccountModule,
    ArticlesModule,
    PagesModule,
    ShopApiModule,
    HealthModule,
  ],
})
export class AppModule {}
