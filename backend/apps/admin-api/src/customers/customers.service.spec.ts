import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import {
  UserEntity,
  AddressEntity,
  OrderEntity,
  UserRoleEntity,
} from '@app/database';
import { NotFoundException } from '@nestjs/common';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('CustomersService', () => {
  let service: CustomersService;
  let mockUserRepo: ReturnType<typeof createMockRepo>;
  let mockAddressRepo: ReturnType<typeof createMockRepo>;
  let mockOrderRepo: ReturnType<typeof createMockRepo>;
  let mockUserRoleRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockUserRepo = createMockRepo(['findAndCount', 'findOne', 'count']);
    mockAddressRepo = createMockRepo(['find']);
    mockOrderRepo = createMockRepo(['findAndCount', 'count', 'createQueryBuilder']);
    mockUserRoleRepo = createMockRepo(['find']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(AddressEntity), useValue: mockAddressRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(UserRoleEntity), useValue: mockUserRoleRepo },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([
        [{ id: 'u-1', email: 'test@example.com' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should filter by search query', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ q: 'test@' });
      expect(mockUserRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ email: expect.any(Object) }),
        }),
      );
    });

    it('should filter by active status', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ isActive: true });
      expect(mockUserRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return customer with order count and total spent', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'u-1',
        email: 'test@example.com',
        userRoles: [],
      });
      mockOrderRepo.count.mockResolvedValue(5);
      mockOrderRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '500000' }),
      });

      const result = await service.findOne('u-1');
      expect(result.email).toBe('test@example.com');
      expect(result.orderCount).toBe(5);
      expect(result.totalSpent).toBe(500000);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOrders', () => {
    it('should return paginated customer orders', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u-1', email: 'test@example.com' });
      mockOrderRepo.findAndCount.mockResolvedValue([
        [{ id: 'o-1', code: 'MA-001' }],
        1,
      ]);

      const result = await service.findOrders('u-1');
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findOrders('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAddresses', () => {
    it('should return customer addresses', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u-1' });
      mockAddressRepo.find.mockResolvedValue([
        { id: 'a-1', streetLine1: '123 Main St', city: 'HCMC' },
      ]);

      const result = await service.findAddresses('u-1');
      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('HCMC');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findAddresses('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
