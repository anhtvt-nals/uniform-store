import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { OptionalAuthGuard } from '@app/common';
import { CurrentUser } from '@app/common';
import { SessionId } from '@app/common';

@ApiTags('Cart')
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get current cart (creates one if not exists)' })
  getCart(
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.getCart(user?.sub, sessionId);
  }

  @Post('items')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @Body() dto: AddItemDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.addItem(dto, user?.sub, sessionId);
  }

  @Patch('items/:lineId')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Param('lineId') lineId: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.updateItem(lineId, dto, user?.sub, sessionId);
  }

  @Delete('items/:lineId')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @Param('lineId') lineId: string,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.removeItem(lineId, user?.sub, sessionId);
  }

  @Post('coupons')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Apply a coupon to the cart' })
  addCoupon(
    @Body() dto: ApplyCouponDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.addCoupon(dto.code, user?.sub, sessionId);
  }

  @Delete('coupons/:code')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Remove a coupon from the cart' })
  removeCoupon(
    @Param('code') code: string,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.cartService.removeCoupon(code, user?.sub, sessionId);
  }

  @Post('merge')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Merge guest cart into user cart after login' })
  mergeCart(
    @CurrentUser() user: any,
    @SessionId() sessionId: string,
  ) {
    return this.cartService.mergeCart(user.sub, sessionId);
  }
}
