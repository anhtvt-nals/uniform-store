import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { CreateOptionGroupDto } from './dto/create-option-group.dto';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto';
import { AssignOptionsDto } from './dto/assign-options.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Products')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'List products with pagination, filters, and sort' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get product with variants, images, and options' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Soft delete a product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Restore a soft-deleted product' })
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Post(':id/variants')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Add a variant (auto-creates inventory, optionally links options)' })
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }

  @Patch(':id/variants/:variantId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a variant (barcode, price, sale price, weight, status)' })
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(id, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Soft delete a variant (removes inventory + option links)' })
  removeVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.removeVariant(id, variantId);
  }

  @Get(':id/variants/:variantId/options')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get assigned options for a variant (color, size, etc.)' })
  getVariantOptions(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.getVariantOptions(id, variantId);
  }

  @Patch(':id/variants/:variantId/options')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Assign options to a variant (replaces all existing)' })
  assignVariantOptions(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: AssignOptionsDto,
  ) {
    return this.productsService.assignVariantOptions(id, variantId, dto);
  }

  @Get(':id/variants/:variantId/inventory')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get inventory for a variant' })
  getVariantInventory(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.getVariantInventory(id, variantId);
  }

  @Patch(':id/variants/:variantId/inventory')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update inventory (quantity, reserved, track, backorder)' })
  updateVariantInventory(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productsService.updateVariantInventory(id, variantId, dto);
  }

  @Post(':id/images')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Add an image to a product' })
  addImage(@Param('id') id: string, @Body() dto: CreateImageDto) {
    return this.productsService.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Soft delete an image' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }

  @Post(':id/option-groups')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Add an option group (e.g. Color, Size)' })
  addOptionGroup(@Param('id') id: string, @Body() dto: CreateOptionGroupDto) {
    return this.productsService.addOptionGroup(id, dto);
  }

  @Patch(':id/option-groups/:groupId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update an option group' })
  updateOptionGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateOptionGroupDto,
  ) {
    return this.productsService.updateOptionGroup(id, groupId, dto);
  }

  @Delete(':id/option-groups/:groupId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Delete an option group' })
  removeOptionGroup(@Param('id') id: string, @Param('groupId') groupId: string) {
    return this.productsService.removeOptionGroup(id, groupId);
  }
}
