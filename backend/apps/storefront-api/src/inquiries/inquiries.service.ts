import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryEntity, ProductEntity, ProductSizeEntity } from '@app/database';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductSizeEntity)
    private readonly productSizeRepo: Repository<ProductSizeEntity>,
  ) {}

  async create(dto: CreateInquiryDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const sizeLink = dto.sizeId
      ? await this.productSizeRepo.findOne({where: {productId: dto.productId, sizeId: dto.sizeId}, relations: ['size']})
      : null;
    if (dto.sizeId && !sizeLink?.size?.isActive) throw new BadRequestException('Size sản phẩm không hợp lệ');
    const inquiry = this.inquiryRepo.create({
      productId: dto.productId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone ?? '',
      company: dto.company ?? '',
      quantity: dto.quantity ?? 1,
      notes: dto.notes ?? '',
      sizeId: sizeLink?.sizeId ?? null,
      sizeName: sizeLink?.size?.code ?? '',
      status: 'pending',
    });

    return this.inquiryRepo.save(inquiry);
  }
}
