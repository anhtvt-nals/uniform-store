import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssetEntity,
  UserEntity,
  RoleEntity,
  UserRoleEntity,
  AdminUserEntity,
  CategoryEntity,
  BrandEntity,
  ProductEntity,
  ProductVariantEntity,
  ProductImageEntity,
  ProductOptionGroupEntity,
  ProductOptionEntity,
  ProductVariantOptionEntity,
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  InventoryEntity,
  StockHistoryEntity,
  OrderEntity,
  OrderItemEntity,
  OrderAddressEntity,
  OrderPaymentEntity,
  OrderDiscountEntity,
  OrderStatusHistoryEntity,
  AddressEntity,
  DiscountEntity,
  CouponEntity,
  CouponUsageEntity,
  ActivityLogEntity,
  SettingEntity,
  CountryEntity,
  ArticleEntity,
  ArticleCategoryEntity,
  ArticleTagEntity,
  InquiryEntity,
  QuoteRequestEntity,
  CustomerContractEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL is required. Configure a Supabase PostgreSQL connection string.');
        }

        const sslEnabled = process.env.DB_SSL === 'true';

        const baseConfig = {
          type: 'postgres' as const,
          entities: [
            AssetEntity,
            UserEntity,
            RoleEntity,
            UserRoleEntity,
            AdminUserEntity,
            CategoryEntity,
            BrandEntity,
            ProductEntity,
            ProductVariantEntity,
            ProductImageEntity,
            ProductOptionGroupEntity,
            ProductOptionEntity,
            ProductVariantOptionEntity,
            CartEntity,
            CartItemEntity,
            CartCouponEntity,
            InventoryEntity,
            StockHistoryEntity,
            OrderEntity,
            OrderItemEntity,
            OrderAddressEntity,
            OrderPaymentEntity,
            OrderDiscountEntity,
            OrderStatusHistoryEntity,
            AddressEntity,
            DiscountEntity,
            CouponEntity,
            CouponUsageEntity,
            ActivityLogEntity,
            SettingEntity,
            CountryEntity,
            ArticleEntity,
            ArticleCategoryEntity,
            ArticleTagEntity,
            InquiryEntity,
            QuoteRequestEntity,
            CustomerContractEntity,
          ],
          synchronize: false,
          logging: process.env.DB_LOGGING === 'true',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };

        return { ...baseConfig, url: process.env.DATABASE_URL };
      },
    }),
  ],
})
export class DatabaseModule {}
