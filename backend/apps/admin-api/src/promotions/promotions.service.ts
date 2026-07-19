import { Injectable } from '@nestjs/common';

@Injectable()
export class PromotionsService {
  findAllDiscounts(): null {
    return null;
  }

  createDiscount(_body: Record<string, unknown>): null {
    return null;
  }

  updateDiscount(_id: string, _body: Record<string, unknown>): null {
    return null;
  }

  removeDiscount(_id: string): null {
    return null;
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
