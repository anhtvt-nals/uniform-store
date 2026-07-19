import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Promotions')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('discounts')
  findAllDiscounts() {
    return this.promotionsService.findAllDiscounts();
  }

  @Post('discounts')
  createDiscount(@Body() _body: Record<string, unknown>) {
    return this.promotionsService.createDiscount(_body);
  }

  @Patch('discounts/:id')
  updateDiscount(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.promotionsService.updateDiscount(_id, _body);
  }

  @Delete('discounts/:id')
  removeDiscount(@Param('id') _id: string) {
    return this.promotionsService.removeDiscount(_id);
  }

  @Get('coupons')
  findAllCoupons() {
    return this.promotionsService.findAllCoupons();
  }

  @Post('coupons')
  createCoupon(@Body() _body: Record<string, unknown>) {
    return this.promotionsService.createCoupon(_body);
  }

  @Patch('coupons/:id')
  updateCoupon(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.promotionsService.updateCoupon(_id, _body);
  }

  @Delete('coupons/:id')
  removeCoupon(@Param('id') _id: string) {
    return this.promotionsService.removeCoupon(_id);
  }

  @Get('coupons/:id/usages')
  findCouponUsages(@Param('id') _id: string) {
    return this.promotionsService.findCouponUsages(_id);
  }
}
