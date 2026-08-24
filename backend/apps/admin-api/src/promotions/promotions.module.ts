import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEntity])],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
