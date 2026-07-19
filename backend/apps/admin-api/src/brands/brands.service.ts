import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { BrandEntity } from '@app/database';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandLogoDto } from './dto/brand-logo.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
  ) {}

  async findAll(query: BrandQueryDto) {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
      sort,
      includeDeleted,
    } = query;

    const where: FindOptionsWhere<BrandEntity> = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) where.name = ILike(`%${search}%`);

    const order = this.parseSort(sort);

    const [items, total] = await this.brandRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
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
    const brand = await this.brandRepo.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }

    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existing = await this.brandRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Slug already exists: ${dto.slug}`);
    }

    const brand = this.brandRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? {},
      logoUrl: dto.logoUrl ?? '',
      websiteUrl: dto.websiteUrl ?? '',
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.brandRepo.save(brand);
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }

    if (dto.slug && dto.slug !== brand.slug) {
      const existing = await this.brandRepo.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Slug already exists: ${dto.slug}`);
      }
    }

    if (dto.name !== undefined) brand.name = dto.name;
    if (dto.slug !== undefined) brand.slug = dto.slug;
    if (dto.description !== undefined) brand.description = dto.description;
    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl;
    if (dto.websiteUrl !== undefined) brand.websiteUrl = dto.websiteUrl;
    if (dto.isActive !== undefined) brand.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) brand.sortOrder = dto.sortOrder;

    return this.brandRepo.save(brand);
  }

  async remove(id: string) {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }

    const productCount = await this.brandRepo.manager
      .createQueryBuilder()
      .from('products', 'p')
      .where('p.brand_id = :id', { id })
      .getCount();

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete brand with ${productCount} associated product(s). Remove or reassign products first.`,
      );
    }

    await this.brandRepo.softRemove(brand);
    return { message: 'Brand deleted successfully' };
  }

  async restore(id: string) {
    const brand = await this.brandRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }

    if (!brand.deletedAt) {
      throw new BadRequestException('Brand is not deleted');
    }

    await this.brandRepo.restore(id);
    return { message: 'Brand restored successfully' };
  }

  async updateLogo(id: string, dto: BrandLogoDto) {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }

    brand.logoUrl = dto.logoUrl;
    return this.brandRepo.save(brand);
  }

  private parseSort(sort?: string): Record<string, 'ASC' | 'DESC'> {
    if (!sort) return { sortOrder: 'ASC' };
    const parts = sort.split(':');
    const field = parts[0] || 'sortOrder';
    const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return { [field]: dir };
  }
}
