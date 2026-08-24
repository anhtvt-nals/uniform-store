import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { CreateCartOrderDto } from './dto/create-cart-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { LookupOrderDto } from './dto/lookup-order.dto';
import { OptionalUserAuthGuard, CurrentUser, SessionId } from '@app/common';

@ApiTags('Orders')
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalUserAuthGuard)
  @ApiOperation({ summary: 'Place an order from current cart' })
  create(
    @Body() dto: PlaceOrderDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.ordersService.create(dto, user?.sub, sessionId);
  }

  @Post('quote')
  @UseGuards(OptionalUserAuthGuard)
  @ApiOperation({ summary: 'Create an order from the cart for sales follow-up' })
  createQuoteOrder(
    @Body() dto: CreateCartOrderDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.ordersService.createFromCartRequest(dto, user?.sub, sessionId);
  }

  @Get()
  @UseGuards(OptionalUserAuthGuard)
  @ApiOperation({ summary: 'List my orders' })
  @ApiBearerAuth()
  findAll(
    @CurrentUser() user: any,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findMyOrders(user.sub, query);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Look up an order by its code and customer email' })
  lookup(@Query() query: LookupOrderDto) {
    return this.ordersService.findOrderByCodeAndEmail(query.code, query.email);
  }

  @Get(':code')
  @UseGuards(OptionalUserAuthGuard)
  @ApiOperation({ summary: 'Get order detail by code' })
  findByCode(
    @Param('code') code: string,
    @CurrentUser() user?: any,
  ) {
    return this.ordersService.findOrderByCode(code, user?.sub);
  }
}
