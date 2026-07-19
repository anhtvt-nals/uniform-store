import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import {
  InventoryEntity,
  StockHistoryEntity,
  ProductVariantEntity,
} from '@app/database';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StockAdjustmentType } from './dto/adjust-stock.dto';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

function createMockQueryRunner() {
  return {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    },
  };
}

describe('InventoryService', () => {
  let service: InventoryService;
  let mockVariantRepo: ReturnType<typeof createMockRepo>;
  let mockInventoryRepo: ReturnType<typeof createMockRepo>;
  let mockHistoryRepo: ReturnType<typeof createMockRepo>;
  let mockQueryRunner: ReturnType<typeof createMockQueryRunner>;

  beforeEach(async () => {
    mockVariantRepo = createMockRepo(['findOne']);
    mockInventoryRepo = createMockRepo(['findOne', 'findAndCount']);
    mockHistoryRepo = createMockRepo(['create', 'findAndCount']);
    mockQueryRunner = createMockQueryRunner();
    const mockDataSource = {
      createQueryRunner: jest.fn(() => mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(InventoryEntity), useValue: mockInventoryRepo },
        { provide: getRepositoryToken(StockHistoryEntity), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(ProductVariantEntity), useValue: mockVariantRepo },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('getInventory', () => {
    it('should return inventory with computed available', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockInventoryRepo.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 10,
        lowStockLevel: 5,
        trackInventory: true,
        allowBackorder: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.getInventory('v-1');
      expect(result.quantity).toBe(100);
      expect(result.reserved).toBe(10);
      expect(result.available).toBe(90);
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(service.getInventory('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if inventory not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockInventoryRepo.findOne.mockResolvedValue(null);
      await expect(service.getInventory('v-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adjustStock', () => {
    it('should increase stock and record history', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 10,
      });
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.adjustStock('v-1', {
        quantityChange: 50,
        type: StockAdjustmentType.ADJUSTMENT,
        reason: 'Restock',
      });

      expect(result.quantity).toBe(150);
      expect(result.available).toBe(140);
      expect(mockHistoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          variantId: 'v-1',
          type: 'adjustment',
          quantityChange: 50,
          quantityBefore: 100,
          quantityAfter: 150,
        }),
      );
    });

    it('should decrease stock and record history', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 10,
      });
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.adjustStock('v-1', {
        quantityChange: -30,
        type: StockAdjustmentType.DAMAGE,
        reasonCode: 'DAMAGED',
        reference: 'PO-001',
      });

      expect(result.quantity).toBe(70);
      expect(result.available).toBe(60);
      expect(mockHistoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantityChange: -30,
          quantityBefore: 100,
          quantityAfter: 70,
          reasonCode: 'DAMAGED',
          reference: 'PO-001',
        }),
      );
    });

    it('should throw BadRequestException on insufficient stock', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 5,
        reserved: 0,
      });

      await expect(
        service.adjustStock('v-1', {
          quantityChange: -10,
          type: StockAdjustmentType.ADJUSTMENT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.adjustStock('nonexistent', {
          quantityChange: 10,
          type: StockAdjustmentType.ADJUSTMENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should auto-create inventory if not exists', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'inv-new',
          variantId: 'v-1',
          quantity: 0,
          reserved: 0,
        });
      mockQueryRunner.manager.create.mockReturnValue({
        id: 'inv-new',
        variantId: 'v-1',
        quantity: 0,
        reserved: 0,
      });
      mockQueryRunner.manager.save.mockResolvedValue({
        id: 'inv-new',
        variantId: 'v-1',
        quantity: 0,
        reserved: 0,
      });
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.adjustStock('v-1', {
        quantityChange: 20,
        type: StockAdjustmentType.ADJUSTMENT,
      });

      expect(result.quantity).toBe(20);
      expect(mockQueryRunner.manager.create).toHaveBeenCalled();
    });
  });

  describe('setStock', () => {
    it('should set stock to absolute value and record correction', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 50,
        reserved: 5,
      });
      mockQueryRunner.manager.update.mockResolvedValue({});
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.setStock('v-1', { quantity: 100 });
      expect(result.quantity).toBe(100);
      expect(result.available).toBe(95);
      expect(mockHistoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'correction',
          quantityChange: 50,
          quantityBefore: 50,
          quantityAfter: 100,
        }),
      );
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.setStock('nonexistent', { quantity: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reserveStock', () => {
    it('should increment reserved count', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 10,
      });
      mockQueryRunner.manager.update.mockResolvedValue({});
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.reserveStock('v-1', { quantity: 5 });
      expect(result.reserved).toBe(15);
      expect(result.available).toBe(85);
    });

    it('should throw BadRequestException if insufficient available', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 10,
        reserved: 8,
      });

      await expect(
        service.reserveStock('v-1', { quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(
        service.reserveStock('v-1', { quantity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('releaseStock', () => {
    it('should decrement reserved count', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 20,
      });
      mockQueryRunner.manager.update.mockResolvedValue({});
      mockHistoryRepo.create.mockReturnValue({});

      const result = await service.releaseStock('v-1', { quantity: 8 });
      expect(result.reserved).toBe(12);
      expect(result.available).toBe(88);
    });

    it('should throw BadRequestException if release exceeds reserved', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'inv-1',
        variantId: 'v-1',
        quantity: 100,
        reserved: 5,
      });

      await expect(
        service.releaseStock('v-1', { quantity: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if inventory not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(
        service.releaseStock('v-1', { quantity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockHistoryRepo.findAndCount.mockResolvedValue([
        [
          { id: 'h-1', variantId: 'v-1', type: 'adjustment', quantityChange: 10 },
          { id: 'h-2', variantId: 'v-1', type: 'correction', quantityChange: -5 },
        ],
        2,
      ]);

      const result = await service.getHistory('v-1', {});
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(service.getHistory('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter by type', async () => {
      mockVariantRepo.findOne.mockResolvedValue({ id: 'v-1' });
      mockHistoryRepo.findAndCount.mockResolvedValue([
        [{ id: 'h-1', variantId: 'v-1', type: 'damage' }],
        1,
      ]);

      const result = await service.getHistory('v-1', { type: 'damage' });
      expect(mockHistoryRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ variantId: 'v-1', type: 'damage' }),
        }),
      );
      expect(result.total).toBe(1);
    });
  });

  describe('getLowStock', () => {
    it('should return items where available <= lowStockLevel', async () => {
      mockInventoryRepo.findAndCount.mockResolvedValue([
        [
          { id: 'inv-1', variantId: 'v-1', quantity: 10, reserved: 8, lowStockLevel: 5, trackInventory: true },
          { id: 'inv-2', variantId: 'v-2', quantity: 50, reserved: 0, lowStockLevel: 5, trackInventory: true },
          { id: 'inv-3', variantId: 'v-3', quantity: 3, reserved: 0, lowStockLevel: 5, trackInventory: true },
        ],
        3,
      ]);

      const result = await service.getLowStock({});
      expect(result.items).toHaveLength(2);
      expect(result.items[0].variantId).toBe('v-1');
      expect(result.items[1].variantId).toBe('v-3');
    });
  });
});
