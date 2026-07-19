import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In, IsNull } from 'typeorm';
import { CategoryEntity } from '@app/database';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { ReorderCategoryDto } from './dto/reorder-category.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findAll(query: CategoryQueryDto) {
    const {
      search,
      parentId,
      isActive,
      page = 1,
      limit = 20,
      sort,
      includeDeleted,
    } = query;

    const where: FindOptionsWhere<CategoryEntity> = {};

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? IsNull() : parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const order: any = this.parseSort(sort);

    const [items, total] = await this.categoryRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['parent'],
      withDeleted: includeDeleted ?? false,
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Slug already exists: ${dto.slug}`);
    }

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? {},
      imageUrl: dto.imageUrl ?? '',
      parentId: dto.parentId ?? null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepo.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Slug already exists: ${dto.slug}`);
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parentId = null;
      } else if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      } else {
        const parent = await this.categoryRepo.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) {
          throw new BadRequestException('Parent category not found');
        }
        category.parentId = dto.parentId;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.imageUrl !== undefined) category.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category with subcategories. Remove or reassign children first.',
      );
    }

    await this.categoryRepo.softRemove(category);
    return { message: 'Category deleted successfully' };
  }

  async restore(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    if (!category.deletedAt) {
      throw new BadRequestException('Category is not deleted');
    }

    await this.categoryRepo.restore(id);
    return { message: 'Category restored successfully' };
  }

  async reorder(dto: ReorderCategoryDto) {
    const ids = dto.items.map((i) => i.id);
    const categories = await this.categoryRepo.find({
      where: { id: In(ids) },
    });

    if (categories.length !== ids.length) {
      throw new BadRequestException('One or more categories not found');
    }

    for (const item of dto.items) {
      await this.categoryRepo.update(item.id, {
        sortOrder: item.sortOrder,
      });
    }

    return { message: 'Categories reordered successfully' };
  }

  async addProduct(categoryId: string, productId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category not found: ${categoryId}`);
    }

    await this.categoryRepo.manager
      .createQueryBuilder()
      .update('products')
      .set({ category_id: categoryId })
      .where('id = :id', { id: productId })
      .execute();

    return { message: 'Product assigned to category' };
  }

  async removeProduct(categoryId: string, productId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category not found: ${categoryId}`);
    }

    await this.categoryRepo.manager
      .createQueryBuilder()
      .update('products')
      .set({ category_id: null })
      .where('id = :id AND category_id = :catId', {
        id: productId,
        catId: categoryId,
      })
      .execute();

    return { message: 'Product removed from category' };
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
}
