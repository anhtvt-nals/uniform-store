import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import {
  ProductEntity,
  ProductVariantEntity,
  ProductImageEntity,
  ProductOptionGroupEntity,
  ProductOptionEntity,
  ProductVariantOptionEntity,
  InventoryEntity,
} from '@app/database';
import {
  BadRequestException,
} from '@nestjs/common';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('ProductsService (admin)', () => {
  let service: ProductsService;
  let mockProductRepo: ReturnType<typeof createMockRepo>;
  let mockVariantRepo: ReturnType<typeof createMockRepo>;
  let mockImageRepo: ReturnType<typeof createMockRepo>;
  let mockOptionGroupRepo: ReturnType<typeof createMockRepo>;
  let mockOptionRepo: ReturnType<typeof createMockRepo>;
  let mockVariantOptionRepo: ReturnType<typeof createMockRepo>;
  let mockInventoryRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockProductRepo = createMockRepo(['findAndCount', 'findOne', 'create', 'save', 'softRemove', 'restore']);
    mockVariantRepo = createMockRepo(['findOne', 'create', 'save', 'softRemove']);
    mockImageRepo = createMockRepo(['findOne', 'create', 'save', 'softRemove']);
    mockOptionGroupRepo = createMockRepo(['findOne', 'create', 'save', 'remove']);
    mockOptionRepo = createMockRepo(['findBy']);
    mockVariantOptionRepo = createMockRepo(['find', 'findOne', 'create', 'save', 'delete']);
    mockInventoryRepo = createMockRepo(['findOne', 'create', 'save', 'delete']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductVariantEntity), useValue: mockVariantRepo },
        { provide: getRepositoryToken(ProductImageEntity), useValue: mockImageRepo },
        { provide: getRepositoryToken(ProductOptionGroupEntity), useValue: mockOptionGroupRepo },
        { provide: getRepositoryToken(ProductOptionEntity), useValue: mockOptionRepo },
        { provide: getRepositoryToken(ProductVariantOptionEntity), useValue: mockVariantOptionRepo },
        { provide: getRepositoryToken(InventoryEntity), useValue: mockInventoryRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([
        [{ id: 'p-1', name: { en: 'Shirt' }, category: null, brand: null }],
        1,
      ]);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return product with all relations', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'p-1',
        name: { en: 'Shirt' },
        variants: [],
        images: [],
        optionGroups: [],
        category: null,
        brand: null,
      });
      const result = await service.findOne('p-1');
      expect(result.id).toBe('p-1');
    });
  });

  describe('addVariant', () => {
    it('should create variant with barcode, auto-create inventory, and link options', async () => {
      mockProductRepo.findOne.mockResolvedValue({ id: 'p-1' });
      mockVariantRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'v-new',
          name: { en: 'Red' },
          sku: 'SHIRT-RED',
          barcode: '8901234567890',
          variantOptions: [],
        });
      mockVariantRepo.create.mockReturnValue({
        id: 'v-new',
        name: { en: 'Red' },
        sku: 'SHIRT-RED',
        barcode: '8901234567890',
      });
      mockVariantRepo.save.mockResolvedValue({
        id: 'v-new',
        name: { en: 'Red' },
        sku: 'SHIRT-RED',
        barcode: '8901234567890',
      });
      mockInventoryRepo.create.mockReturnValue({ variantId: 'v-new' });
      mockInventoryRepo.save.mockResolvedValue({ variantId: 'v-new' });
      mockOptionRepo.findBy.mockResolvedValue([
        { id: 'opt-1' },
        { id: 'opt-2' },
      ]);
      mockVariantOptionRepo.create.mockReturnValue({});
      mockVariantOptionRepo.save.mockResolvedValue([]);

      const result = await service.addVariant('p-1', {
        name: { en: 'Red' },
        sku: 'SHIRT-RED',
        barcode: '8901234567890',
        price: 150000,
        optionIds: ['opt-1', 'opt-2'],
      });

      expect(result).not.toBeNull();
      expect(result!.sku).toBe('SHIRT-RED');
      expect(result!.barcode).toBe('8901234567890');
      expect(mockInventoryRepo.save).toHaveBeenCalled();
      expect(mockVariantOptionRepo.save).toHaveBeenCalled();
    });

    it('should throw if invalid option IDs provided', async () => {
      mockProductRepo.findOne.mockResolvedValue({ id: 'p-1' });
      mockVariantRepo.findOne.mockResolvedValue(null);
      mockVariantRepo.create.mockReturnValue({ id: 'v-new' });
      mockVariantRepo.save.mockResolvedValue({ id: 'v-new' });
      mockInventoryRepo.create.mockReturnValue({});
      mockInventoryRepo.save.mockResolvedValue({});
      mockOptionRepo.findBy.mockResolvedValue([{ id: 'opt-1' }]);

      await expect(
        service.addVariant('p-1', {
          name: { en: 'Test' },
          sku: 'SKU',
          price: 100,
          optionIds: ['opt-1', 'invalid-id'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVariant', () => {
    it('should update barcode and other fields', async () => {
      const variant = {
        id: 'v-1',
        productId: 'p-1',
        name: { en: 'Old' },
        sku: 'OLD',
        barcode: '',
        price: 100,
        comparePrice: null,
        taxRate: 0,
        weight: 0,
        isActive: true,
        sortOrder: 0,
      };
      mockVariantRepo.findOne.mockResolvedValue(variant);
      mockVariantRepo.save.mockResolvedValue({
        ...variant,
        barcode: 'NEW-BARCODE',
        price: 120,
        comparePrice: 150,
      });

      const result = await service.updateVariant('p-1', 'v-1', {
        barcode: 'NEW-BARCODE',
        price: 120,
        comparePrice: 150,
      });

      expect(result.barcode).toBe('NEW-BARCODE');
      expect(result.price).toBe(120);
      expect(result.comparePrice).toBe(150);
    });
  });

  describe('removeVariant', () => {
    it('should delete inventory and option links then soft delete', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
      });
      mockInventoryRepo.delete.mockResolvedValue({});
      mockVariantOptionRepo.delete.mockResolvedValue({});
      mockVariantRepo.softRemove.mockResolvedValue({});

      const result = await service.removeVariant('p-1', 'v-1');
      expect(result.message).toContain('deleted');
      expect(mockInventoryRepo.delete).toHaveBeenCalledWith({
        variantId: 'v-1',
      });
      expect(mockVariantOptionRepo.delete).toHaveBeenCalledWith({
        variantId: 'v-1',
      });
    });
  });

  describe('assignVariantOptions', () => {
    it('should replace all option assignments', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
      });
      mockOptionRepo.findBy.mockResolvedValue([
        { id: 'opt-1' },
        { id: 'opt-2' },
        { id: 'opt-3' },
      ]);
      mockVariantOptionRepo.delete.mockResolvedValue({});
      mockVariantOptionRepo.create.mockReturnValue({});
      mockVariantOptionRepo.save.mockResolvedValue([]);
      mockVariantOptionRepo.find.mockResolvedValue([]);

      const result = await service.assignVariantOptions('p-1', 'v-1', {
        optionIds: ['opt-1', 'opt-2', 'opt-3'],
      });

      expect(mockVariantOptionRepo.delete).toHaveBeenCalledWith({
        variantId: 'v-1',
      });
      expect(mockVariantOptionRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateVariantInventory', () => {
    it('should create inventory if not exists and update fields', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
      });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      mockInventoryRepo.create.mockReturnValue({ variantId: 'v-1' });
      mockInventoryRepo.save.mockResolvedValue({
        variantId: 'v-1',
        quantity: 50,
        lowStockLevel: 10,
      });

      const result = await service.updateVariantInventory('p-1', 'v-1', {
        quantity: 50,
        lowStockLevel: 10,
      });

      expect(result.quantity).toBe(50);
      expect(mockInventoryRepo.create).toHaveBeenCalledWith({
        variantId: 'v-1',
      });
    });

    it('should update existing inventory', async () => {
      mockVariantRepo.findOne.mockResolvedValue({
        id: 'v-1',
        productId: 'p-1',
      });
      mockInventoryRepo.findOne.mockResolvedValue({
        variantId: 'v-1',
        quantity: 10,
        reserved: 0,
        lowStockLevel: 5,
      });
      mockInventoryRepo.save.mockResolvedValue({
        variantId: 'v-1',
        quantity: 25,
        reserved: 0,
        lowStockLevel: 5,
      });

      const result = await service.updateVariantInventory('p-1', 'v-1', {
        quantity: 25,
      });

      expect(result.quantity).toBe(25);
    });
  });
});
