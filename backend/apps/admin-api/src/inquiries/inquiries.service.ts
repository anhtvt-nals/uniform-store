import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { InquiryEntity } from '@app/database';
import { InquiryQueryDto } from './dto/inquiry-query.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,
  ) {}

  async findAll(query: InquiryQueryDto) {
    const { search, status, page = 1, limit = 20 } = query;

    const qb = this.inquiryRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.product', 'p')
      .where('i.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        "(i.full_name ILIKE :search OR i.email ILIKE :search OR i.company ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('i.status = :status', { status });
    }

    qb.orderBy('i.created_at', 'DESC');

    const total = await qb.clone().getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const inquiry = await this.inquiryRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product'],
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  async updateStatus(id: string, status: string) {
    const inquiry = await this.findOne(id);
    inquiry.status = status;
    return this.inquiryRepo.save(inquiry);
  }

  async remove(id: string) {
    const inquiry = await this.findOne(id);
    inquiry.deletedAt = new Date();
    return this.inquiryRepo.save(inquiry);
  }
}
