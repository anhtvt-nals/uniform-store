import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  ProductVariantEntity,
  InventoryEntity,
} from '@app/database';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('CartService', () => {
  let service: CartService;
  let mockCartRepo: ReturnType<typeof createMockRepo>;
  let mockCartItemRepo: ReturnType<typeof createMockRepo>;
  let mockCartCouponRepo: ReturnType<typeof createMockRepo>;
  let mockVariantRepo: ReturnType<typeof createMockRepo>;
  let mockInventoryRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockCartRepo = createMockRepo(['findOne', 'create', 'save', 'update']);
    mockCartItemRepo = createMockRepo([
      'findOne', 'find', 'create', 'save', 'update', 'remove',
    ]);
    mockCartCouponRepo = createMockRepo([
      'findOne', 'find', 'create', 'save', 'remove',
    ]);
    mockVariantRepo = createMockRepo(['findOne']);
    mockInventoryRepo = createMockRepo(['findOne']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(CartEntity), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItemEntity), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(CartCouponEntity), useValue: mockCartCouponRepo },
        { provide: getRepositoryToken(ProductVariantEntity), useValue: mockVariantRepo },
        { provide: getRepositoryToken(InventoryEntity), useValue: mockInventoryRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  const sampleItems = [
    {
      id: 'item-1',
      cartId: 'cart-1',
      variantId: 'v-1',
      quantity: 2,
      unitPrice: 150000,
      createdAt: new Date(),
      updatedAt: new Date(),
      variant: {
        id: 'v-1',
        productId: 'p-1',
        name: { en: 'Red' },
        sku: 'TS-RED',
        price: 150000,
        product: {
          id: 'p-1',
          name: { en: 'T-Shirt' },
          slug: 't-shirt',
          images: [{ url: 'https://example.com/img.jpg' }],
        },
      },
    },
  ];

  const sampleCoupons = [
    { id: 'c-1', cartId: 'cart-1', couponCode: 'SAVE10', discountAmount: 0 },
  ];

  describe('getCart', () => {
    it('should return existing cart for user', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.getCart('user-1');
      expect(result.id).toBe('cart-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].lineTotal).toBe(300000);
    });

    it('should create cart if not exists for user', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockCartRepo.create.mockReturnValue({ id: 'cart-new', userId: 'user-1', status: 'active' });
      mockCartRepo.save.mockResolvedValue({ id: 'cart-new', userId: 'user-1', status: 'active' });
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.getCart('user-1');
      expect(result.id).toBe('cart-new');
    });

    it('should return cart for session', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-sess' });
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.getCart(undefined, 'sess-1');
      expect(result.id).toBe('cart-sess');
    });

    it('should throw if no user or session', async () => {
      await expect(service.getCart()).rejects.toThrow(BadRequestException);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
        price: 150000,
        isActive: true,
      });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue(null);
      mockCartItemRepo.create.mockReturnValue({});
      mockCartItemRepo.save.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.addItem(
        { productId: 'p-1', variantId: 'v-1', quantity: 2 },
        'user-1',
      );
      expect(result.items).toHaveLength(1);
      expect(mockCartItemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-1',
          variantId: 'v-1',
          quantity: 2,
          unitPrice: 150000,
        }),
      );
    });

    it('should update quantity if same variant already in cart', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
        price: 150000,
        isActive: true,
      });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        variantId: 'v-1',
        quantity: 2,
      });
      mockCartItemRepo.update.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.addItem(
        { productId: 'p-1', variantId: 'v-1', quantity: 3 },
        'user-1',
      );
      expect(mockCartItemRepo.update).toHaveBeenCalledWith('item-1', {
        quantity: 5,
      });
    });

    it('should resolve first active variant if no variantId given', async () => {
      mockVariantRepo.findOne.mockResolvedValueOnce({
        id: 'v-1',
        productId: 'p-1',
        price: 150000,
        isActive: true,
      });
      mockVariantRepo.findOne.mockResolvedValueOnce({
        id: 'v-1',
        productId: 'p-1',
        price: 150000,
        isActive: true,
        product: { id: 'p-1' },
      });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue(null);
      mockCartItemRepo.create.mockReturnValue({});
      mockCartItemRepo.save.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.addItem(
        { productId: 'p-1', quantity: 1 },
        'user-1',
      );
      expect(mockVariantRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { productId: 'p-1', isActive: true } }),
      );
    });

    it('should throw if variant not found for product', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addItem({ productId: 'p-1', quantity: 1 }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if insufficient stock', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
        price: 150000,
        isActive: true,
      });
      mockInventoryRepo.findOne.mockResolvedValue({
        variantId: 'v-1',
        quantity: 5,
        reserved: 3,
        trackInventory: true,
        allowBackorder: false,
      });

      await expect(
        service.addItem(
          { productId: 'p-1', variantId: 'v-1', quantity: 5 },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('should update quantity', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        variantId: 'v-1',
        quantity: 2,
      });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      mockCartItemRepo.update.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.updateItem('item-1', { quantity: 5 }, 'user-1');
      expect(mockCartItemRepo.update).toHaveBeenCalledWith('item-1', {
        quantity: 5,
      });
    });

    it('should throw if item not found', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateItem('nonexistent', { quantity: 3 }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
      });
      mockCartItemRepo.remove.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.removeItem('item-1', 'user-1');
      expect(result.items).toHaveLength(0);
    });

    it('should throw if item not found', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartItemRepo.findOne.mockResolvedValue(null);

      await expect(
        service.removeItem('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addCoupon', () => {
    it('should add coupon to cart', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartCouponRepo.create.mockReturnValue({});
      mockCartCouponRepo.save.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue(sampleCoupons);

      const result = await service.addCoupon('SAVE10', 'user-1');
      expect(result.coupons).toHaveLength(1);
      expect(result.coupons[0].couponCode).toBe('SAVE10');
    });
  });

  describe('removeCoupon', () => {
    it('should remove coupon from cart', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-1' });
      mockCartCouponRepo.findOne.mockResolvedValue({
        id: 'c-1',
        cartId: 'cart-1',
        couponCode: 'SAVE10',
      });
      mockCartCouponRepo.remove.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue(sampleItems);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.removeCoupon('SAVE10', 'user-1');
      expect(result.coupons).toHaveLength(0);
    });
  });

  describe('mergeCart', () => {
    it('should merge session cart items into user cart', async () => {
      const sessionCart = {
        id: 'cart-sess',
        sessionId: 'sess-1',
        status: 'active',
        items: [
          {
            id: 'si-1',
            variantId: 'v-2',
            quantity: 1,
            unitPrice: 200000,
          },
        ],
      };
      const userCart = {
        id: 'cart-user',
        userId: 'user-1',
        status: 'active',
        items: [
          {
            id: 'ui-1',
            variantId: 'v-1',
            quantity: 2,
            unitPrice: 150000,
          },
        ],
      };

      mockCartRepo.findOne
        .mockResolvedValueOnce(sessionCart)
        .mockResolvedValueOnce(userCart)
        .mockResolvedValue(userCart);
      mockCartItemRepo.create.mockImplementation((input) => input);
      mockCartItemRepo.save.mockResolvedValue({});
      mockCartRepo.update.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.mergeCart('user-1', 'sess-1');
      expect(mockCartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: 'cart-user',
          variantId: 'v-2',
          quantity: 1,
          unitPrice: 200000,
        }),
      );
      expect(mockCartRepo.update).toHaveBeenCalledWith('cart-sess', {
        status: 'converted',
      });
    });

    it('should create user cart if not exists', async () => {
      const sessionCart = {
        id: 'cart-sess',
        sessionId: 'sess-1',
        status: 'active',
        items: [
          {
            id: 'si-1',
            variantId: 'v-1',
            quantity: 1,
            unitPrice: 150000,
          },
        ],
      };

      mockCartRepo.findOne
        .mockResolvedValueOnce(sessionCart)
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ id: 'cart-new' });
      mockCartRepo.create.mockReturnValue({ id: 'cart-new' });
      mockCartRepo.save.mockResolvedValue({ id: 'cart-new' });
      mockCartItemRepo.save.mockResolvedValue({});
      mockCartRepo.update.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.mergeCart('user-1', 'sess-1');
      expect(mockCartRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', status: 'active' }),
      );
    });

    it('should merge quantities for same variant', async () => {
      const sessionCart = {
        id: 'cart-sess',
        sessionId: 'sess-1',
        status: 'active',
        items: [
          {
            id: 'si-1',
            variantId: 'v-1',
            quantity: 1,
            unitPrice: 150000,
          },
        ],
      };
      const userCart = {
        id: 'cart-user',
        userId: 'user-1',
        status: 'active',
        items: [
          {
            id: 'ui-1',
            variantId: 'v-1',
            quantity: 2,
            unitPrice: 150000,
          },
        ],
      };

      mockCartRepo.findOne
        .mockResolvedValueOnce(sessionCart)
        .mockResolvedValueOnce(userCart)
        .mockResolvedValue(userCart);
      mockCartItemRepo.update.mockResolvedValue({});
      mockCartRepo.update.mockResolvedValue({});
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.mergeCart('user-1', 'sess-1');
      expect(mockCartItemRepo.update).toHaveBeenCalledWith('ui-1', {
        quantity: 3,
      });
    });

    it('should return user cart if no session cart', async () => {
      mockCartRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ id: 'cart-user' });
      mockCartItemRepo.find.mockResolvedValue([]);
      mockCartCouponRepo.find.mockResolvedValue([]);

      const result = await service.mergeCart('user-1', 'sess-1');
      expect(result.id).toBe('cart-user');
    });
  });
});
