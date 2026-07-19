import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BrandsService } from './brands.service';
import { BrandEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

const mockBrandRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  manager: {
    createQueryBuilder: jest.fn(),
  },
};

function mockQueryBuilder() {
  const qb: any = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };
  qb.clone = jest.fn().mockReturnValue(qb);
  return qb;
}

describe('BrandsService (storefront)', () => {
  let service: BrandsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: getRepositoryToken(BrandEntity),
          useValue: mockBrandRepo,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  describe('findAll', () => {
    it('should return paginated active brands', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([
        [{ id: 'b-1', name: { en: 'Minh An' }, slug: 'minh-an', isActive: true }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].slug).toBe('minh-an');
    });

    it('should filter by search', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        search: 'nonexistent',
        page: 1,
        limit: 20,
      });

      expect(result.total).toBe(0);
    });
  });

  describe('findBySlug', () => {
    it('should return brand when found', async () => {
      const brand = {
        id: 'b-1',
        name: { en: 'Minh An' },
        slug: 'minh-an',
        isActive: true,
      };
      mockBrandRepo.findOne.mockResolvedValue(brand);

      const result = await service.findBySlug('minh-an');
      expect(result.slug).toBe('minh-an');
    });

    it('should throw NotFoundException when not found', async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProducts', () => {
    it('should return paginated products by brand', async () => {
      const brand = { id: 'b-1', slug: 'minh-an', isActive: true };
      mockBrandRepo.findOne.mockResolvedValue(brand);

      const qb = mockQueryBuilder();
      qb.getCount.mockResolvedValue(3);
      qb.getRawMany.mockResolvedValue([{ id: 'p-1' }, { id: 'p-2' }]);
      mockBrandRepo.manager.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findProducts('minh-an', {
        page: 1,
        limit: 10,
      });

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(2);
    });

    it('should throw NotFoundException for invalid slug', async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findProducts('nonexistent', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
