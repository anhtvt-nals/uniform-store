import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List active products with search, filters, pagination, and sort',
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'List featured products' })
  @ApiQuery({ name: 'limit', required: false })
  findFeatured(@Query('limit') limit?: string) {
    return this.productsService.findFeatured(limit ? parseInt(limit, 10) : 8);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug with variants, images, and options' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':slug/variants')
  @ApiOperation({ summary: 'Get active variants for a product' })
  findVariants(@Param('slug') slug: string) {
    return this.productsService.findVariants(slug);
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related products (same category)' })
  findRelated(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.productsService.findRelated(
      slug,
      limit ? parseInt(limit, 10) : 4,
    );
  }
}
