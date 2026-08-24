import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountEntity } from '@app/database';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepo: Repository<DiscountEntity>,
  ) {}

  findAllDiscounts() {
    return this.discountRepo.find({
      order: { createdAt: 'DESC' },
      withDeleted: false,
    });
  }

  createDiscount(body: CreateDiscountDto) {
    return this.discountRepo.save(
      this.discountRepo.create({
        name: { vi: body.name.trim() },
        type: body.type,
        value: body.value,
        target: 'product',
        targetIds: body.productIds,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        minQuantityPerProduct: body.minQuantityPerProduct ?? 1,
        isActive: true,
      }),
    );
  }

  async updateDiscount(id: string, body: CreateDiscountDto) {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) throw new NotFoundException('Không tìm thấy khuyến mãi');

    discount.name = { vi: body.name.trim() };
    discount.type = body.type;
    discount.value = body.value;
    discount.target = 'product';
    discount.targetIds = body.productIds;
    discount.endsAt = body.endsAt ? new Date(body.endsAt) : null;
    discount.minQuantityPerProduct = body.minQuantityPerProduct ?? 1;
    return this.discountRepo.save(discount);
  }

  async removeDiscount(id: string) {
    const result = await this.discountRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException('Không tìm thấy khuyến mãi');
    return { id };
  }

  findAllCoupons(): null {
    return null;
  }

  createCoupon(_body: Record<string, unknown>): null {
    return null;
  }

  updateCoupon(_id: string, _body: Record<string, unknown>): null {
    return null;
  }

  removeCoupon(_id: string): null {
    return null;
  }

  findCouponUsages(_id: string): null {
    return null;
  }
}
