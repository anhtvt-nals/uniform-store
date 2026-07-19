import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import {
  OrderEntity,
  OrderItemEntity,
  UserEntity,
} from '@app/database';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

function mockQueryBuilder(returnValue: any) {
  return {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(returnValue),
    getRawMany: jest.fn().mockResolvedValue(returnValue),
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  let mockOrderRepo: ReturnType<typeof createMockRepo>;
  let mockOrderItemRepo: ReturnType<typeof createMockRepo>;
  let mockUserRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockOrderRepo = createMockRepo([
      'count', 'createQueryBuilder', 'find',
    ]);
    mockOrderItemRepo = createMockRepo([
      'createQueryBuilder',
    ]);
    mockUserRepo = createMockRepo([
      'count', 'createQueryBuilder',
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItemEntity), useValue: mockOrderItemRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('should return aggregated stats', async () => {
      mockOrderRepo.count.mockResolvedValueOnce(150);
      mockUserRepo.count.mockResolvedValue(42);
      mockOrderRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder({ total: '5000000' }),
      );
      mockOrderRepo.count.mockResolvedValueOnce(12);

      const result = await service.getStats();
      expect(result.totalOrders).toBe(150);
      expect(result.totalRevenue).toBe(5000000);
      expect(result.pendingOrders).toBe(12);
      expect(result.totalCustomers).toBe(42);
    });
  });

  describe('getRevenue', () => {
    it('should return revenue by period', async () => {
      const qb = mockQueryBuilder({ total: '100000' });
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRevenue();
      expect(result.today).toBe(100000);
      expect(result.thisWeek).toBe(100000);
      expect(result.thisMonth).toBe(100000);
      expect(result.thisYear).toBe(100000);
    });
  });

  describe('getOrders', () => {
    it('should return recent orders and status counts', async () => {
      mockOrderRepo.find.mockResolvedValue([
        { id: 'o-1', code: 'MA-001', status: 'pending' },
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder([
          { status: 'pending', count: '5' },
          { status: 'confirmed', count: '3' },
        ]),
      );

      const result = await service.getOrders(5);
      expect(result.recent).toHaveLength(1);
      expect(result.statusCounts).toHaveLength(2);
      expect(result.statusCounts[0].count).toBe(5);
    });
  });

  describe('getTopProducts', () => {
    it('should return top selling products', async () => {
      const qb = mockQueryBuilder([
        {
          variantId: 'v-1',
          productName: { en: 'T-Shirt' },
          sku: 'TS-001',
          totalSold: '50',
          totalRevenue: '7500000',
        },
      ]);
      mockOrderItemRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTopProducts(5);
      expect(result).toHaveLength(1);
      expect(result[0].totalSold).toBe(50);
      expect(result[0].totalRevenue).toBe(7500000);
    });
  });

  describe('getRevenueSummary', () => {
    it('should return daily revenue summary', async () => {
      const qb = mockQueryBuilder([
        { date: '2026-07-01', revenue: '100000', orders: '3' },
        { date: '2026-07-02', revenue: '150000', orders: '5' },
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRevenueSummary(7);
      expect(result).toHaveLength(2);
      expect(result[0].orders).toBe(3);
    });
  });

  describe('getOrderStats', () => {
    it('should return order stats grouped by status', async () => {
      const qb = mockQueryBuilder([
        { status: 'pending', count: '10', total: '1000000' },
        { status: 'confirmed', count: '5', total: '500000' },
      ]);
      mockOrderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getOrderStats();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('pending');
      expect(result[0].total).toBe(1000000);
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      mockUserRepo.count.mockResolvedValueOnce(100);
      mockUserRepo.count.mockResolvedValueOnce(10);
      mockUserRepo.count.mockResolvedValueOnce(85);

      const result = await service.getCustomerStats(30);
      expect(result.total).toBe(100);
      expect(result.newCustomers).toBe(10);
      expect(result.active).toBe(85);
    });
  });
});
