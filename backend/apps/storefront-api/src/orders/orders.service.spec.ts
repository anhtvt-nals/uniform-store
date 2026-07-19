import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  OrderEntity,
  OrderItemEntity,
  OrderAddressEntity,
  OrderPaymentEntity,
  OrderDiscountEntity,
  OrderStatusHistoryEntity,
  InventoryEntity,
} from '@app/database';

function createMockQueryRunner() {
  return {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    },
  };
}

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('OrdersService (storefront)', () => {
  let service: OrdersService;
  let mockCartRepo: ReturnType<typeof createMockRepo>;
  let mockCartItemRepo: ReturnType<typeof createMockRepo>;
  let mockCartCouponRepo: ReturnType<typeof createMockRepo>;
  let mockOrderRepo: ReturnType<typeof createMockRepo>;
  let mockQueryRunner: ReturnType<typeof createMockQueryRunner>;

  beforeEach(async () => {
    mockCartRepo = createMockRepo(['findOne']);
    mockCartItemRepo = createMockRepo(['find']);
    mockCartCouponRepo = createMockRepo(['find']);
    mockOrderRepo = createMockRepo(['findOne', 'findAndCount']);
    mockQueryRunner = createMockQueryRunner();
    const mockDataSource = {
      createQueryRunner: jest.fn(() => mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(CartEntity), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItemEntity), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(CartCouponEntity), useValue: mockCartCouponRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItemEntity), useValue: createMockRepo(['create', 'save']) },
        { provide: getRepositoryToken(OrderAddressEntity), useValue: createMockRepo(['create', 'save']) },
        { provide: getRepositoryToken(OrderPaymentEntity), useValue: createMockRepo(['create', 'save']) },
        { provide: getRepositoryToken(OrderDiscountEntity), useValue: createMockRepo(['create', 'save']) },
        { provide: getRepositoryToken(OrderStatusHistoryEntity), useValue: createMockRepo(['create', 'save']) },
        { provide: getRepositoryToken(InventoryEntity), useValue: createMockRepo(['findOne']) },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    const dto = {
      email: 'test@example.com',
      shippingAddress: {
        fullName: 'Test User',
        streetLine1: '123 Main St',
        city: 'HCMC',
        countryCode: 'VN',
      },
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    };

    const cartItems = [
      {
        id: 'item-1',
        variantId: 'v-1',
        quantity: 2,
        unitPrice: 150000,
        variant: {
          sku: 'TS-RED',
          name: { en: 'Red' },
          product: { name: { en: 'T-Shirt' } },
        },
      },
    ];

    it('should create order from cart', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.find.mockResolvedValue(cartItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      mockQueryRunner.manager.create.mockImplementation(
        (entity: any, data: any) => data,
      );
      mockQueryRunner.manager.save.mockImplementation((data: any) =>
        Promise.resolve({ ...data, id: 'order-1', code: 'MA-20260714-0001' }),
      );

      mockOrderRepo.findOne.mockResolvedValue({
        id: 'order-1',
        code: 'MA-20260714-0001',
        email: 'test@example.com',
        status: 'pending',
        items: [],
        addresses: [],
        payments: [],
        discounts: [],
        statusHistory: [],
      });

      const result = await service.create(dto, 'user-1');

      expect(result.code).toBe('MA-20260714-0001');
      expect(result.status).toBe('pending');
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no active cart', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        'No active cart found',
      );
    });

    it('should throw BadRequestException if cart is empty', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.find.mockResolvedValue([]);

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        'Cart is empty',
      );
    });

    it('should rollback transaction on error', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.find.mockResolvedValue(cartItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      mockQueryRunner.manager.create.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.create(dto, 'user-1')).rejects.toThrow('DB error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findMyOrders', () => {
    it('should return paginated orders for user', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([
        [{ id: 'o-1', code: 'MA-001' }],
        1,
      ]);

      const result = await service.findMyOrders('user-1', { page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findMyOrders('user-1', { status: 'pending' });
      expect(mockOrderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1', status: 'pending' }),
        }),
      );
    });
  });

  describe('findOrderByCode', () => {
    it('should return order by code', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'o-1',
        code: 'MA-001',
        items: [],
        addresses: [],
        payments: [],
        discounts: [],
        statusHistory: [],
      });

      const result = await service.findOrderByCode('MA-001', 'user-1');
      expect(result.code).toBe('MA-001');
    });

    it('should throw NotFoundException if not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOrderByCode('MA-999'),
      ).rejects.toThrow('Order not found: MA-999');
    });
  });
});
