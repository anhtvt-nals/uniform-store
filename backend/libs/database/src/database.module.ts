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
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const sslEnabled =
          process.env.DB_SSL === 'true' ||
          process.env.NODE_ENV === 'production' ||
          (process.env.DATABASE_URL?.includes('supabase.co') ?? false);

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
          ],
          synchronize: false,
          logging: process.env.DB_LOGGING === 'true',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };

        if (process.env.DATABASE_URL) {
          return { ...baseConfig, url: process.env.DATABASE_URL };
        }

        return {
          ...baseConfig,
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'uniform_store',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
