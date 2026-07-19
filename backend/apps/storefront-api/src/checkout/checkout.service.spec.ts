import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { OrdersService } from '../orders/orders.service';
import { BadRequestException } from '@nestjs/common';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let mockOrdersService: Record<string, jest.Mock>;
  let mockCache: Record<string, jest.Mock>;

  const cacheStore = new Map<string, any>();

  beforeEach(async () => {
    cacheStore.clear();
    mockOrdersService = {
      create: jest.fn(),
    };
    mockCache = {
      get: jest.fn(async (key: string) => cacheStore.get(key) ?? null),
      set: jest.fn(async (key: string, value: any) => {
        cacheStore.set(key, value);
      }),
      del: jest.fn(async (key: string) => {
        cacheStore.delete(key);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: 'CacheService', useValue: mockCache },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  describe('setCustomer', () => {
    it('should store customer info in cache', async () => {
      const dto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.setCustomer(dto, 'user-1');
      expect(result.message).toContain('saved');
      expect(cacheStore.get('checkout:user-1').customer).toEqual(dto);
    });
  });

  describe('setShippingAddress', () => {
    it('should store shipping address', async () => {
      const addr = {
        line1: '123 Main St',
        city: 'HCMC',
        postalCode: '70000',
        countryCode: 'VN',
        phone: '0909123456',
      };

      const result = await service.setShippingAddress(addr, 'user-1');
      expect(result.message).toContain('saved');

      const session = cacheStore.get('checkout:user-1');
      expect(session.shippingAddress).toEqual(addr);
    });
  });

  describe('setBillingAddress', () => {
    it('should store billing address', async () => {
      const addr = {
        line1: '456 Oak Ave',
        city: 'HCMC',
        postalCode: '70000',
        countryCode: 'VN',
      };

      const result = await service.setBillingAddress(addr, 'user-1');
      expect(result.message).toContain('saved');

      const session = cacheStore.get('checkout:user-1');
      expect(session.billingAddress).toEqual(addr);
    });
  });

  describe('getShippingMethods', () => {
    it('should return available methods', () => {
      const result = service.getShippingMethods();
      expect(result.methods.length).toBeGreaterThan(0);
      const codes = result.methods.map((m: any) => m.code);
      expect(codes).toContain('standard');
      expect(codes).toContain('express');
    });
  });

  describe('confirm', () => {
    it('should create order from cache session when no DTO provided', async () => {
      const session = {
        customer: { email: 'test@example.com' },
        shippingAddress: {
          line1: '123 Main St',
          city: 'HCMC',
          countryCode: 'VN',
        },
        shippingMethod: 'standard',
        paymentMethod: 'cod',
      };
      cacheStore.set('checkout:user-1', session);

      mockOrdersService.create.mockResolvedValue({
        id: 'order-1',
        code: 'MA-001',
        status: 'pending',
      });

      const result = await service.confirm('user-1');
      expect(result.code).toBe('MA-001');
      expect(mockOrdersService.create).toHaveBeenCalled();
      expect(cacheStore.has('checkout:user-1')).toBe(false);
    });

    it('should create order from DTO when provided', async () => {
      const dto = {
        email: 'test@example.com',
        shippingAddress: {
          fullName: 'Test User',
          streetLine1: '123 Main St',
          city: 'HCMC',
          countryCode: 'VN',
        },
        shippingMethod: 'express',
        paymentMethod: 'momo',
      };

      mockOrdersService.create.mockResolvedValue({
        id: 'order-2',
        code: 'MA-002',
        status: 'pending',
      });

      const result = await service.confirm('user-2', undefined, dto as any);
      expect(result.code).toBe('MA-002');
      expect(mockOrdersService.create).toHaveBeenCalledWith(
        dto,
        'user-2',
        undefined,
      );
    });

    it('should throw BadRequestException if no session and no DTO', async () => {
      await expect(service.confirm('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
