import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/order-query.dto';
import { AdminAuthGuard, RolesGuard, Roles, CurrentUser } from '@app/common';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'List all orders (paginated, filterable)' })
  findAll(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get order detail with all relations' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update order status with history' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('admin') admin?: any,
  ) {
    return this.ordersService.updateStatus(id, dto, admin?.id ?? admin?.sub);
  }

  @Get(':id/status-history')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get order status history' })
  getStatusHistory(@Param('id') id: string) {
    return this.ordersService.getStatusHistory(id);
  }
}
