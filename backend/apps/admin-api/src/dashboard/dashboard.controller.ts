import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get overall dashboard stats' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('revenue')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get revenue totals (today, week, month, year)' })
  getRevenue() {
    return this.dashboardService.getRevenue();
  }

  @Get('orders')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get recent orders and status counts' })
  getOrders(@Query('limit') limit?: number) {
    return this.dashboardService.getOrders(limit);
  }

  @Get('top-products')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get top selling products' })
  getTopProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('revenue-summary')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get revenue summary by day' })
  getRevenueSummary(@Query('days') days?: number) {
    return this.dashboardService.getRevenueSummary(days);
  }

  @Get('order-stats')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get order statistics grouped by status' })
  getOrderStats() {
    return this.dashboardService.getOrderStats();
  }

  @Get('customer-stats')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get customer statistics' })
  getCustomerStats(@Query('days') days?: number) {
    return this.dashboardService.getCustomerStats(days);
  }
}
