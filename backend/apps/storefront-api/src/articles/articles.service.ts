import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ArticleEntity,
  ArticleCategoryEntity,
  ArticleTagEntity,
} from '@app/database';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(ArticleCategoryEntity)
    private readonly categoryRepo: Repository<ArticleCategoryEntity>,
    @InjectRepository(ArticleTagEntity)
    private readonly tagRepo: Repository<ArticleTagEntity>,
  ) {}

  async findAll(query: {
    skip?: number;
    take?: number;
    search?: string;
    category?: string;
    tag?: string;
  }) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 10;

    const qb = this.articleRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.categories', 'cat')
      .leftJoinAndSelect('a.tags', 't')
      .where('a.is_published = true')
      .andWhere('a.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        "a.title->>'en' ILIKE :search OR a.title->>'vi' ILIKE :search OR a.excerpt->>'en' ILIKE :search",
        { search: `%${query.search}%` },
      );
    }
    if (query.category) {
      qb.andWhere('cat.slug = :catSlug', { catSlug: query.category });
    }
    if (query.tag) {
      qb.andWhere('t.slug = :tagSlug', { tagSlug: query.tag });
    }

    qb.orderBy('a.publishedAt', 'DESC');
    qb.skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findBySlug(slug: string) {
    return this.articleRepo.findOne({
      where: { slug, isPublished: true, deletedAt: IsNull() },
      relations: ['categories', 'tags'],
    });
  }

  async findCategories() {
    const [items, total] = await this.categoryRepo.findAndCount({
      where: { isActive: true, deletedAt: IsNull() },
      order: { sortOrder: 'ASC' },
    });
    return { items, total };
  }

  async findTags() {
    const [items, total] = await this.tagRepo.findAndCount({
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }
}
