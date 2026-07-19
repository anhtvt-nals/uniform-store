import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import {
  AssetEntity,
  ProductImageEntity,
  ProductEntity,
  CategoryEntity,
  BrandEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetEntity,
      ProductImageEntity,
      ProductEntity,
      CategoryEntity,
      BrandEntity,
    ]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
