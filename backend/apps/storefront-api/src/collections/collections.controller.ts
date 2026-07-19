import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { ProductQueryDto } from '../products/dto/product-query.dto';

@ApiTags('Categories')
@Controller('api/v1/categories')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories as a tree' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with children' })
  findBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findBySlug(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'List products in category (includes subcategories)' })
  findProducts(
    @Param('slug') slug: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.collectionsService.findProducts(slug, query);
  }
}
