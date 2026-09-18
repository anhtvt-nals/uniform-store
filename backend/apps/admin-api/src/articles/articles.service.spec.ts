import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticleEntity, ArticleCategoryEntity, ArticleTagEntity } from '@app/database';

describe('ArticlesService', () => {
  it('persists supplied SEO fields', async () => {
    const articleRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const tagRepo = { find: jest.fn().mockResolvedValue([]), create: jest.fn(), save: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(ArticleEntity), useValue: articleRepo },
        { provide: getRepositoryToken(ArticleCategoryEntity), useValue: {} },
        { provide: getRepositoryToken(ArticleTagEntity), useValue: tagRepo },
      ],
    }).compile();

    const result = await module.get(ArticlesService).createArticle({
      title: { vi: 'Bài viết' }, slug: 'bai-viet',
      metaTitle: { vi: 'SEO title' }, ogImageUrl: { vi: 'https://cdn/img.jpg' },
    });

    expect(result.metaTitle).toEqual({ vi: 'SEO title' });
    expect(result.ogImageUrl).toEqual({ vi: 'https://cdn/img.jpg' });
  });
});
