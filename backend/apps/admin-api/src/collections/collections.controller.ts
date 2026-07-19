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
import { CollectionsService } from './collections.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { ReorderCategoryDto } from './dto/reorder-category.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('categories')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'List categories with pagination, search, and sort' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.collectionsService.create(dto);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get a single category by ID' })
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Soft delete a category (must have no children)' })
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Restore a soft-deleted category' })
  restore(@Param('id') id: string) {
    return this.collectionsService.restore(id);
  }

  @Patch(':id/sort-order')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Batch reorder categories' })
  reorder(@Body() dto: ReorderCategoryDto) {
    return this.collectionsService.reorder(dto);
  }

  @Post(':id/products')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Assign a product to the category' })
  addProduct(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.collectionsService.addProduct(id, productId);
  }

  @Delete(':id/products/:productId')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Remove a product from the category' })
  removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.collectionsService.removeProduct(id, productId);
  }
}
