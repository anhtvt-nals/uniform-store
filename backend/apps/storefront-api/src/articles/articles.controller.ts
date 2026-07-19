import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { ProductQueryDto } from '../products/dto/product-query.dto';

@ApiTags('Articles')
@Controller('api/v1')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('articles')
  findAll(@Query() query: ProductQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('articles/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Get('article-categories')
  findCategories() {
    return this.articlesService.findCategories();
  }

  @Get('article-tags')
  findTags() {
    return this.articlesService.findTags();
  }
}
