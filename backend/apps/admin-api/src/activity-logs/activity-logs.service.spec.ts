import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('ActivityLogsService', () => {
  let service: ActivityLogsService;
  let mockLogRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockLogRepo = createMockRepo([
      'findAndCount', 'findOne', 'createQueryBuilder',
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogsService,
        { provide: getRepositoryToken(ActivityLogEntity), useValue: mockLogRepo },
      ],
    }).compile();

    service = module.get<ActivityLogsService>(ActivityLogsService);
  });

  describe('findAll', () => {
    it('should return paginated logs', async () => {
      mockLogRepo.findAndCount.mockResolvedValue([
        [{ id: 'l-1', action: 'order.created' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 50 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should filter by action', async () => {
      mockLogRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ action: 'order.created' });
      expect(mockLogRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'order.created' }),
        }),
      );
    });

    it('should filter by entity type', async () => {
      mockLogRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ entityType: 'order' });
      expect(mockLogRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'order' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockLogRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ from: '2026-01-01', to: '2026-12-31' });
      expect(mockLogRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({ _type: 'between' }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return log by id', async () => {
      mockLogRepo.findOne.mockResolvedValue({
        id: 'l-1',
        action: 'order.created',
        entityType: 'order',
      });

      const result = await service.findOne('l-1');
      expect(result.action).toBe('order.created');
    });

    it('should throw NotFoundException if not found', async () => {
      mockLogRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDistinctActions', () => {
    it('should return distinct action types', async () => {
      mockLogRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { action: 'order.created' },
          { action: 'product.updated' },
        ]),
      });

      const result = await service.getDistinctActions();
      expect(result).toContain('order.created');
      expect(result).toHaveLength(2);
    });
  });

  describe('getDistinctEntityTypes', () => {
    it('should return distinct entity types', async () => {
      mockLogRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { entityType: 'order' },
          { entityType: 'product' },
        ]),
      });

      const result = await service.getDistinctEntityTypes();
      expect(result).toContain('order');
      expect(result).toHaveLength(2);
    });
  });
});
