import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SetCustomerDto } from './dto/set-customer.dto';
import { AddressDto } from './dto/address.dto';
import { OrdersService } from '../orders/orders.service';
import { PlaceOrderDto } from '../orders/dto/place-order.dto';
import { CacheService } from '@app/shared';

interface CheckoutSession {
  customer?: SetCustomerDto;
  shippingAddress?: AddressDto;
  billingAddress?: AddressDto;
  sameAsBilling?: boolean;
  shippingMethod?: string;
  paymentMethod?: string;
}

@Injectable()
export class CheckoutService {
  constructor(
    @Inject('CacheService')
    private readonly cache: CacheService,
    private readonly ordersService: OrdersService,
  ) {}

  async setCustomer(
    dto: SetCustomerDto,
    userId?: string,
    sessionId?: string,
  ) {
    const session = await this.getSession(userId, sessionId);
    session.customer = dto;
    await this.saveSession(userId, sessionId, session);
    return { message: 'Customer info saved', customer: dto };
  }

  async setShippingAddress(
    dto: AddressDto,
    userId?: string,
    sessionId?: string,
  ) {
    const session = await this.getSession(userId, sessionId);
    session.shippingAddress = dto;
    await this.saveSession(userId, sessionId, session);
    return { message: 'Shipping address saved' };
  }

  async setBillingAddress(
    dto: AddressDto,
    userId?: string,
    sessionId?: string,
  ) {
    const session = await this.getSession(userId, sessionId);
    session.billingAddress = dto;
    session.sameAsBilling = false;
    await this.saveSession(userId, sessionId, session);
    return { message: 'Billing address saved' };
  }

  getShippingMethods() {
    return {
      methods: [
        { code: 'standard', name: 'Standard Shipping', price: 0 },
        { code: 'express', name: 'Express Shipping', price: 50000 },
      ],
    };
  }

  async setShippingMethod(
    code: string,
    userId?: string,
    sessionId?: string,
  ) {
    const session = await this.getSession(userId, sessionId);
    session.shippingMethod = code;
    await this.saveSession(userId, sessionId, session);
    return { message: 'Shipping method selected', method: code };
  }

  getPaymentMethods() {
    return {
      methods: [
        { code: 'cod', name: 'Cash on Delivery' },
        { code: 'bank_transfer', name: 'Bank Transfer' },
        { code: 'momo', name: 'MoMo Wallet' },
      ],
    };
  }

  async setPayment(method: string, userId?: string, sessionId?: string) {
    const session = await this.getSession(userId, sessionId);
    session.paymentMethod = method;
    await this.saveSession(userId, sessionId, session);
    return { message: 'Payment method saved', method };
  }

  async getSummary(userId?: string, sessionId?: string) {
    const session = await this.getSession(userId, sessionId);

    if (!session || !session.customer) {
      throw new BadRequestException(
        'Checkout session not initialized. Start with customer info.',
      );
    }

    const billingAddress = session.sameAsBilling
      ? session.shippingAddress
      : session.billingAddress ?? session.shippingAddress;

    return {
      customer: session.customer,
      shippingAddress: session.shippingAddress,
      billingAddress,
      shippingMethod: session.shippingMethod,
      paymentMethod: session.paymentMethod,
    };
  }

  async confirm(userId?: string, sessionId?: string, dto?: PlaceOrderDto) {
    if (dto) {
      const result = await this.ordersService.create(dto, userId, sessionId);
      return result;
    }

    const session = await this.getSession(userId, sessionId);
    if (!session || !session.customer) {
      throw new BadRequestException(
        'No checkout session found. Complete checkout steps first.',
      );
    }

    const shippingAddr = this.mapAddress(session.shippingAddress);
    const billingAddr = session.sameAsBilling
      ? shippingAddr
      : this.mapAddress(
          session.billingAddress ?? session.shippingAddress,
        );

    const placeOrderDto: PlaceOrderDto = {
      email: session.customer.email,
      shippingAddress: {
        fullName:
          `${session.customer.firstName ?? ''} ${session.customer.lastName ?? ''}`.trim() ||
          'Customer',
        streetLine1: shippingAddr.streetLine1,
        streetLine2: shippingAddr.streetLine2,
        city: shippingAddr.city,
        province: shippingAddr.province,
        postalCode: shippingAddr.postalCode,
        countryCode: shippingAddr.countryCode,
        phone: shippingAddr.phone,
      },
      billingAddress: {
        fullName:
          `${session.customer.firstName ?? ''} ${session.customer.lastName ?? ''}`.trim() ||
          'Customer',
        streetLine1: billingAddr.streetLine1,
        streetLine2: billingAddr.streetLine2,
        city: billingAddr.city,
        province: billingAddr.province,
        postalCode: billingAddr.postalCode,
        countryCode: billingAddr.countryCode,
        phone: billingAddr.phone,
      },
      shippingMethod: session.shippingMethod ?? 'standard',
      paymentMethod: session.paymentMethod ?? 'cod',
    };

    const result = await this.ordersService.create(
      placeOrderDto,
      userId,
      sessionId,
    );

    await this.cache.del(this.cacheKey(userId, sessionId));

    return result;
  }

  private mapAddress(addr?: AddressDto) {
    return {
      streetLine1: addr?.line1 ?? '',
      streetLine2: addr?.line2 ?? '',
      city: addr?.city ?? '',
      province: addr?.state ?? '',
      postalCode: addr?.postalCode ?? '',
      countryCode: addr?.countryCode ?? 'VN',
      phone: addr?.phone ?? '',
    };
  }

  private cacheKey(userId?: string, sessionId?: string): string {
    const key = userId ?? sessionId;
    if (!key) throw new BadRequestException('User or session ID required');
    return `checkout:${key}`;
  }

  private async getSession(
    userId?: string,
    sessionId?: string,
  ): Promise<CheckoutSession> {
    const key = this.cacheKey(userId, sessionId);
    const session = await this.cache.get<CheckoutSession>(key);
    return session ?? {};
  }

  private async saveSession(
    userId?: string,
    sessionId?: string,
    session?: CheckoutSession,
  ) {
    const key = this.cacheKey(userId, sessionId);
    await this.cache.set(key, session, 3600_000);
  }
}
