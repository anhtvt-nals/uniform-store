import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequestEntity } from '@app/database';
import { QuoteRequestQueryDto } from './dto/quote-request-query.dto';

@Injectable()
export class QuoteRequestsService {
  constructor(
    @InjectRepository(QuoteRequestEntity)
    private readonly quoteRequestRepo: Repository<QuoteRequestEntity>,
  ) {}

  async findAll(query: QuoteRequestQueryDto) {
    const { search, status, page = 1, limit = 20 } = query;

    const qb = this.quoteRequestRepo.createQueryBuilder('q');

    if (search) {
      qb.where(
        '(q.customer_name ILIKE :search OR q.phone ILIKE :search OR q.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('q.status = :status', { status });
    }

    qb.orderBy('q.created_at', 'DESC');

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
    const quoteRequest = await this.quoteRequestRepo.findOne({ where: { id } });
    if (!quoteRequest) throw new NotFoundException('Quote request not found');
    return quoteRequest;
  }

  async updateStatus(id: string, status: string) {
    const quoteRequest = await this.findOne(id);
    quoteRequest.status = status;
    return this.quoteRequestRepo.save(quoteRequest);
  }

  async updateNotes(id: string, salesNote: string) {
    const quoteRequest = await this.findOne(id);
    quoteRequest.salesNote = salesNote;
    return this.quoteRequestRepo.save(quoteRequest);
  }
}
