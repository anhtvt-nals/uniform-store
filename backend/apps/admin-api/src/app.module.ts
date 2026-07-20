import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@app/database';
import { SharedModule } from '@app/shared';
import { CommonModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { BrandsModule } from './brands/brands.module';
import { FacetsModule } from './facets/facets.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { ArticlesModule } from './articles/articles.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentModule } from './payment/payment.module';
import { UploadsModule } from './uploads/uploads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { PermissionsModule } from './permissions/permissions.module';
import { InquiriesModule } from './inquiries/inquiries.module';

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
    FacetsModule,
    OrdersModule,
    CustomersModule,
    ArticlesModule,
    PromotionsModule,
    ShippingModule,
    PaymentModule,
    UploadsModule,
    DashboardModule,
    InventoryModule,
    ActivityLogsModule,
    PermissionsModule,
    InquiriesModule,
    HealthModule,
  ],
})
export class AppModule {}
