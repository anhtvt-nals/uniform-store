import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequestEntity } from '@app/database';
import { MailService } from '@app/shared';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';

@Injectable()
export class QuoteRequestsService {
  constructor(
    @InjectRepository(QuoteRequestEntity)
    private readonly quoteRequestRepo: Repository<QuoteRequestEntity>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateQuoteRequestDto) {
    const quoteRequest = this.quoteRequestRepo.create({
      customerName: dto.customerName,
      phone: dto.phone,
      email: dto.email ?? '',
      region: dto.region ?? '',
      address: dto.address ?? '',
      productType: dto.productType ?? '',
      quantity: dto.quantity ?? 1,
      source: dto.source ?? '',
      status: 'NEW',
    });

    const saved = await this.quoteRequestRepo.save(quoteRequest);

    await this.mailService.sendQuoteRequestNotification({
      customerName: saved.customerName,
      phone: saved.phone,
      email: saved.email,
      region: saved.region,
      address: saved.address,
      productType: saved.productType,
      quantity: saved.quantity,
    });

    return saved;
  }
}
