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
import { OrderQueryDto } from './dto/order-query.dto';
import { OptionalAuthGuard, CurrentUser, SessionId } from '@app/common';

@ApiTags('Orders')
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Place an order from current cart' })
  create(
    @Body() dto: PlaceOrderDto,
    @CurrentUser() user?: any,
    @SessionId() sessionId?: string,
  ) {
    return this.ordersService.create(dto, user?.sub, sessionId);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'List my orders' })
  @ApiBearerAuth()
  findAll(
    @CurrentUser() user: any,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findMyOrders(user.sub, query);
  }

  @Get(':code')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get order detail by code' })
  findByCode(
    @Param('code') code: string,
    @CurrentUser() user?: any,
  ) {
    return this.ordersService.findOrderByCode(code, user?.sub);
  }
}
