import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { BrandQueryDto } from './dto/brand-query.dto';

@ApiTags('Brands')
@Controller('api/v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'List active brands with pagination, search, and sort' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a brand by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'List products by brand with pagination' })
  findProducts(
    @Param('slug') slug: string,
    @Query() query: BrandQueryDto,
  ) {
    return this.brandsService.findProducts(slug, query);
  }
}
