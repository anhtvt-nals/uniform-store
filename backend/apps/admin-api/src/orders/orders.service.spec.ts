import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import {
  OrderEntity,
  OrderStatusHistoryEntity,
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

describe('OrdersService (admin)', () => {
  let service: OrdersService;
  let mockOrderRepo: ReturnType<typeof createMockRepo>;
  let mockStatusHistoryRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockOrderRepo = createMockRepo([
      'findAndCount', 'findOne', 'save',
    ]);
    mockStatusHistoryRepo = createMockRepo([
      'create', 'save', 'find',
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderStatusHistoryEntity), useValue: mockStatusHistoryRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([
        [{ id: 'o-1', code: 'MA-001' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'pending' });
      expect(mockOrderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'pending' }),
        }),
      );
    });

    it('should search by code with q parameter', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ q: 'MA-001' });
      expect(mockOrderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            code: expect.objectContaining({ _value: '%MA-001%' }),
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ from: '2026-01-01', to: '2026-12-31' });
      expect(mockOrderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({ _type: 'between' }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return order with relations', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'o-1',
        code: 'MA-001',
        items: [],
        addresses: [],
        payments: [],
        discounts: [],
        statusHistory: [],
      });

      const result = await service.findOne('o-1');
      expect(result.id).toBe('o-1');
      expect(mockOrderRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'o-1' },
          relations: expect.arrayContaining(['items', 'addresses', 'payments']),
        }),
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    const mockOrder = {
      id: 'o-1',
      code: 'MA-001',
      status: 'pending',
    };

    it('should update status and create history record', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ ...mockOrder });
      mockOrderRepo.save.mockResolvedValue({ ...mockOrder, status: 'confirmed' });
      mockStatusHistoryRepo.create.mockReturnValue({});
      mockStatusHistoryRepo.save.mockResolvedValue({});

      const result = await service.updateStatus('o-1', { status: 'confirmed' }, 'admin-1');

      expect(result.status).toBe('confirmed');
      expect(result.previousStatus).toBe('pending');
      expect(mockStatusHistoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'o-1',
          fromStatus: 'pending',
          toStatus: 'confirmed',
          performedBy: 'admin-1',
        }),
      );
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ ...mockOrder, status: 'delivered' });

      await expect(
        service.updateStatus('o-1', { status: 'pending' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cancelling shipped order', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ ...mockOrder, status: 'shipped' });

      await expect(
        service.updateStatus('o-1', { status: 'cancelled' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', { status: 'confirmed' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatusHistory', () => {
    it('should return status history ordered by newest first', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'o-1' });
      mockStatusHistoryRepo.find.mockResolvedValue([
        { id: 'h-2', toStatus: 'confirmed', createdAt: new Date('2026-07-14T10:01:00') },
        { id: 'h-1', toStatus: 'pending', createdAt: new Date('2026-07-14T10:00:00') },
      ]);

      const result = await service.getStatusHistory('o-1');
      expect(result).toHaveLength(2);
      expect(result[0].toStatus).toBe('confirmed');
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.getStatusHistory('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
