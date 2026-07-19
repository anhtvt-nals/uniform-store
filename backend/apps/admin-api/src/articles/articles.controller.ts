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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Articles')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('articles')
  findAllArticles(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.articlesService.findAllArticles(Number(page) || 1, Number(limit) || 20);
  }

  @Post('articles')
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articlesService.createArticle(dto);
  }

  @Get('articles/:id')
  findOneArticle(@Param('id') id: string) {
    return this.articlesService.findOneArticle(id);
  }

  @Patch('articles/:id')
  updateArticle(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  removeArticle(@Param('id') id: string) {
    return this.articlesService.removeArticle(id);
  }

  @Get('article-categories')
  findAllCategories() {
    return this.articlesService.findAllCategories();
  }

  @Post('article-categories')
  createCategory(@Body() _body: Record<string, unknown>) {
    return this.articlesService.createCategory(_body);
  }

  @Patch('article-categories/:id')
  updateCategory(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.articlesService.updateCategory(_id, _body);
  }

  @Delete('article-categories/:id')
  removeCategory(@Param('id') _id: string) {
    return this.articlesService.removeCategory(_id);
  }

  @Get('article-tags')
  findAllTags() {
    return this.articlesService.findAllTags();
  }

  @Post('article-tags')
  createTag(@Body() _body: Record<string, unknown>) {
    return this.articlesService.createTag(_body);
  }

  @Delete('article-tags/:id')
  removeTag(@Param('id') _id: string) {
    return this.articlesService.removeTag(_id);
  }
}
