import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In, Raw, IsNull } from 'typeorm';
import { ProductEntity, CategoryEntity, ProductImageEntity } from '@app/database';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly imageRepo: Repository<ProductImageEntity>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const {
      search,
      categorySlug,
      brandSlug,
      isFeatured,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.brand', 'brand')
      .where('p.deleted_at IS NULL')
      .andWhere('p.is_active = true');

    if (search) {
      qb.andWhere(
        "(p.name->>'en' ILIKE :search OR p.name->>'vi' ILIKE :search OR p.name->>'de' ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (categorySlug) {
      const category = await this.categoryRepo.findOne({
        where: { slug: categorySlug, isActive: true },
      });
      if (category) {
        const subIds = await this.getSubcategoryIds(category.id);
        qb.andWhere('p.category_id IN (:...catIds)', {
          catIds: [category.id, ...subIds],
        });
      }
    }

    if (brandSlug) {
      qb.andWhere('brand.slug = :brandSlug', { brandSlug });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('p.is_featured = :isFeatured', { isFeatured });
    }

    if (minPrice !== undefined) {
      qb.andWhere('p.base_price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('p.base_price <= :maxPrice', { maxPrice });
    }

    if (sort) {
      const parts = sort.split(':');
      const field = parts[0] || 'createdAt';
      const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const allowedFields = ['createdAt', 'basePrice', 'name', 'updatedAt'];
      const safeField = allowedFields.includes(field) ? field : 'createdAt';
      qb.orderBy(`p.${safeField}`, dir);
    } else {
      qb.orderBy('p.createdAt', 'DESC');
    }

    const total = await qb.clone().getCount();
    const items = await qb
      .clone()
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const productIds = items.map((p) => p.id);
    const allImages = productIds.length > 0
      ? await this.imageRepo.find({
          where: { productId: In(productIds), deletedAt: IsNull() },
          order: { sortOrder: 'ASC' },
        })
      : [];
    const imageMap = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const list = imageMap.get(img.productId) || [];
      list.push(img);
      imageMap.set(img.productId, list);
    }

    return {
      items: items.map((p) => ({
        ...p,
        images: imageMap.get(p.id) || [],
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: [
        'category',
        'brand',
        'variants',
        'variants.variantOptions',
        'variants.variantOptions.option',
        'variants.variantOptions.option.group',
        'images',
        'optionGroups',
        'optionGroups.options',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    return {
      ...product,
      variants: product.variants
        ?.filter((v) => v.isActive && !v.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
      images: product.images
        ?.filter((i) => !i.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
      optionGroups: product.optionGroups?.map((g) => ({
        ...g,
        options: g.options?.sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
      })) ?? [],
    };
  }

  async findVariants(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['variants', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    const variants = product.variants
      ?.filter((v) => v.isActive && !v.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

    const images = product.images
      ?.filter((i) => !i.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

    return variants.map((v) => ({
      ...v,
      images: images.filter((i) => !i.variantId || i.variantId === v.id),
    }));
  }

  async findRelated(slug: string, limit = 4) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      select: ['id', 'categoryId'],
    });

    if (!product) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    const related = await this.productRepo.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: Raw((alias) => `${alias} != :id`, { id: product.id }),
      },
      relations: ['images'],
      take: limit,
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
    });

    return related;
  }

  async findFeatured(limit = 8) {
    return this.productRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['images'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  private async getSubcategoryIds(parentId: string): Promise<string[]> {
    const children = await this.categoryRepo.find({
      where: { parentId, isActive: true },
      select: ['id'],
    });
    const ids = children.map((c) => c.id);
    for (const child of children) {
      const grandchildIds = await this.getSubcategoryIds(child.id);
      ids.push(...grandchildIds);
    }
    return ids;
  }
}
