import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, IsNull } from 'typeorm';
import { CategoryEntity } from '@app/database';
import { CategoryQueryDto } from './dto/category-query.dto';
import { ProductQueryDto } from '../products/dto/product-query.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findAll(query: CategoryQueryDto) {
    const { search, page = 1, limit = 10, sort } = query;

    const where: FindOptionsWhere<CategoryEntity> = {
      isActive: true,
      parentId: IsNull(),
    };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const order: any = this.parseSort(sort);

    const [items, total] = await this.categoryRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['children'],
    });

    const tree = this.buildTree(items);

    return {
      items: tree,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      meta: { type: 'category_tree' },
    };
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${slug}`);
    }

    return category;
  }

  async findProducts(slug: string, query: ProductQueryDto) {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${slug}`);
    }

    const subcategoryIds = await this.getSubcategoryIds(category.id);
    const allIds = [category.id, ...subcategoryIds];

    const { page = 1, limit = 10, sort } = query;

    const qb = this.categoryRepo.manager
      .createQueryBuilder()
      .from('products', 'p')
      .where('p.category_id IN (:...ids)', { ids: allIds })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('p.is_active = true');

    if (query.search) {
      qb.andWhere(
        "p.name->>'en' ILIKE :search OR p.name->>'vi' ILIKE :search",
        { search: `%${query.search}%` },
      );
    }

    const count = await qb.clone().getCount();

    qb.skip((page - 1) * limit).take(limit);

    if (sort) {
      this.applyProductSort(qb, sort);
    } else {
      qb.orderBy('p.created_at', 'DESC');
    }

    const items = await qb.getRawMany();

    return {
      items,
      total: count,
      page,
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
    };
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

  private buildTree(
    categories: CategoryEntity[],
  ): (CategoryEntity & { children: any[] })[] {
    return categories.map((cat) => ({
      ...cat,
      children: cat.children
        ? this.buildActiveTree(cat.children)
        : [],
    }));
  }

  private buildActiveTree(
    categories: CategoryEntity[],
  ): (CategoryEntity & { children: any[] })[] {
    return categories
      .filter((c) => c.isActive)
      .map((cat) => ({
        ...cat,
        children: cat.children
          ? this.buildActiveTree(cat.children)
          : [],
      }));
  }

  private parseSort(
    sort?: string,
  ): Record<string, 'ASC' | 'DESC'> {
    if (!sort) return { sortOrder: 'ASC' };
    const parts = sort.split(':');
    const field = parts[0] || 'sortOrder';
    const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return { [field]: dir };
  }

  private applyProductSort(qb: any, sort: string): void {
    const parts = sort.split(':');
    const field = parts[0] || 'created_at';
    const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(`p.${field}`, dir);
  }
}
