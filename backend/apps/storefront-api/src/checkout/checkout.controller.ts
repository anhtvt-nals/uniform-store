import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { SetCustomerDto } from './dto/set-customer.dto';
import { AddressDto } from './dto/address.dto';
import { PlaceOrderDto } from '../orders/dto/place-order.dto';
import { OptionalAuthGuard, CurrentUser, SessionId } from '@app/common';

@ApiTags('Checkout')
@Controller('api/v1/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('customer')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Set customer email and name' })
  setCustomer(
    @Body() dto: SetCustomerDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.setCustomer(dto, user?.sub, sessionId);
  }

  @Post('shipping-address')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Set shipping address' })
  setShippingAddress(
    @Body() dto: AddressDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.setShippingAddress(dto, user?.sub, sessionId);
  }

  @Post('billing-address')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Set billing address' })
  setBillingAddress(
    @Body() dto: AddressDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.setBillingAddress(dto, user?.sub, sessionId);
  }

  @Get('shipping-methods')
  @ApiOperation({ summary: 'Get available shipping methods' })
  getShippingMethods() {
    return this.checkoutService.getShippingMethods();
  }

  @Post('shipping-method')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Select shipping method' })
  setShippingMethod(
    @Body('code') code: string,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.setShippingMethod(code, user?.sub, sessionId);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get available payment methods' })
  getPaymentMethods() {
    return this.checkoutService.getPaymentMethods();
  }

  @Post('payment')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Select payment method' })
  setPayment(
    @Body('method') method: string,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.setPayment(method, user?.sub, sessionId);
  }

  @Get('summary')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get checkout summary' })
  getSummary(
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.getSummary(user?.sub, sessionId);
  }

  @Post('confirm')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Place order (from cached session or direct DTO)' })
  confirm(
    @Body() dto: PlaceOrderDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.checkoutService.confirm(user?.sub, sessionId, dto);
  }
}
