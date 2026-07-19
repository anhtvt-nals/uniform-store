import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import {
  ArticleEntity,
  ArticleCategoryEntity,
  ArticleTagEntity,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleEntity,
      ArticleCategoryEntity,
      ArticleTagEntity,
    ]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
