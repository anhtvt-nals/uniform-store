import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  FindOptionsWhere,
} from 'typeorm';
import { BrandEntity } from '@app/database';
import { BrandQueryDto } from './dto/brand-query.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
  ) {}

  async findAll(query: BrandQueryDto) {
    const { search, page = 1, limit = 20, sort } = query;

    const where: FindOptionsWhere<BrandEntity> = { isActive: true };
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const order = this.parseSort(sort);

    const [items, total] = await this.brandRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const brand = await this.brandRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${slug}`);
    }

    return brand;
  }

  async findProducts(slug: string, query: { page?: number; limit?: number; sort?: string; search?: string }) {
    const brand = await this.brandRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${slug}`);
    }

    const { page = 1, limit = 10, sort, search } = query;

    const qb = this.brandRepo.manager
      .createQueryBuilder()
      .from('products', 'p')
      .where('p.brand_id = :brandId', { brandId: brand.id })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('p.is_active = true');

    if (search) {
      qb.andWhere(
        "p.name->>'en' ILIKE :search OR p.name->>'vi' ILIKE :search",
        { search: `%${search}%` },
      );
    }

    const count = await qb.clone().getCount();

    qb.skip((page - 1) * limit).take(limit);

    if (sort) {
      const parts = sort.split(':');
      const field = parts[0] || 'created_at';
      const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`p.${field}`, dir);
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

  private parseSort(sort?: string): Record<string, 'ASC' | 'DESC'> {
    if (!sort) return { sortOrder: 'ASC' };
    const parts = sort.split(':');
    const field = parts[0] || 'sortOrder';
    const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return { [field]: dir };
  }
}
