import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { SetStockDto } from './dto/set-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReleaseStockDto } from './dto/release-stock.dto';
import { InventoryHistoryQueryDto } from './dto/inventory-history-query.dto';
import { AdminAuthGuard, RolesGuard, Roles, CurrentUser } from '@app/common';

@ApiTags('Admin Inventory')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('variants/:variantId')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get inventory by variant (with computed available stock)' })
  getInventory(@Param('variantId') variantId: string) {
    return this.inventoryService.getInventory(variantId);
  }

  @Post('variants/:variantId/adjust')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Adjust stock by delta (positive or negative)' })
  adjustStock(
    @Param('variantId') variantId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser('admin') admin?: any,
  ) {
    return this.inventoryService.adjustStock(variantId, dto, admin?.sub);
  }

  @Post('variants/:variantId/set')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Set stock to an absolute value' })
  setStock(
    @Param('variantId') variantId: string,
    @Body() dto: SetStockDto,
    @CurrentUser('admin') admin?: any,
  ) {
    return this.inventoryService.setStock(variantId, dto, admin?.sub);
  }

  @Post('variants/:variantId/reserve')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Reserve stock (increment reserved count)' })
  reserveStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReserveStockDto,
    @CurrentUser('admin') admin?: any,
  ) {
    return this.inventoryService.reserveStock(variantId, dto, admin?.sub);
  }

  @Post('variants/:variantId/release')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Release reserved stock (decrement reserved count)' })
  releaseStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReleaseStockDto,
    @CurrentUser('admin') admin?: any,
  ) {
    return this.inventoryService.releaseStock(variantId, dto, admin?.sub);
  }

  @Get('variants/:variantId/history')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get paginated stock history for a variant' })
  getHistory(
    @Param('variantId') variantId: string,
    @Query() query: InventoryHistoryQueryDto,
  ) {
    return this.inventoryService.getHistory(variantId, query);
  }

  @Get('low-stock')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get variants with low stock' })
  getLowStock(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getLowStock({ page, limit });
  }
}
