import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { ArticleEntity, ArticleCategoryEntity, ArticleTagEntity } from '@app/database';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

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

  async findAllArticles(page = 1, limit = 20) {
    const [items, total] = await this.articleRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneArticle(id: string) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article not found: ${id}`);
    }
    return article;
  }

  async createArticle(dto: CreateArticleDto) {
    const existing = await this.articleRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Slug already exists: ${dto.slug}`);
    }

    const article = this.articleRepo.create({
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt ?? {},
      content: dto.content ?? {},
      imageUrl: dto.imageUrl ?? '',
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : undefined,
    });

    return this.articleRepo.save(article);
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article not found: ${id}`);
    }

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.articleRepo.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Slug already exists: ${dto.slug}`);
      }
    }

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.slug !== undefined) article.slug = dto.slug;
    if (dto.excerpt !== undefined) article.excerpt = dto.excerpt;
    if (dto.content !== undefined) article.content = dto.content;
    if (dto.imageUrl !== undefined) article.imageUrl = dto.imageUrl;
    if (dto.isPublished !== undefined) {
      article.isPublished = dto.isPublished;
      if (dto.isPublished && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    return this.articleRepo.save(article);
  }

  async removeArticle(id: string) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article not found: ${id}`);
    }
    await this.articleRepo.softRemove(article);
    return { message: 'Article deleted successfully' };
  }

  async findAllCategories() {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async createCategory(body: Record<string, unknown>) {
    const cat = this.categoryRepo.create(body as any);
    return this.categoryRepo.save(cat);
  }

  async updateCategory(id: string, body: Record<string, unknown>) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category not found: ${id}`);
    Object.assign(cat, body);
    return this.categoryRepo.save(cat);
  }

  async removeCategory(id: string) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category not found: ${id}`);
    await this.categoryRepo.softRemove(cat);
    return { message: 'Category deleted successfully' };
  }

  async findAllTags() {
    return this.tagRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createTag(body: Record<string, unknown>) {
    const tag = this.tagRepo.create(body as any);
    return this.tagRepo.save(tag);
  }

  async removeTag(id: string) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag not found: ${id}`);
    await this.tagRepo.remove(tag);
    return { message: 'Tag deleted successfully' };
  }
}
