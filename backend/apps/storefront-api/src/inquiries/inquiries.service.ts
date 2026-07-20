import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryEntity, ProductEntity } from '@app/database';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateInquiryDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const inquiry = this.inquiryRepo.create({
      productId: dto.productId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone ?? '',
      company: dto.company ?? '',
      quantity: dto.quantity ?? 1,
      notes: dto.notes ?? '',
      status: 'pending',
    });

    return this.inquiryRepo.save(inquiry);
  }
}
