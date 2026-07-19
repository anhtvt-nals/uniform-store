import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Customers')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'List customers (paginated, searchable)' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get customer detail with order count and total spent' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/orders')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get customer order history' })
  findOrders(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customersService.findOrders(id, page, limit);
  }

  @Get(':id/addresses')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get customer addresses' })
  findAddresses(@Param('id') id: string) {
    return this.customersService.findAddresses(id);
  }
}
