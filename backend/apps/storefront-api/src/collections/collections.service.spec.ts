import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CategoryEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

const mockCategoryRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
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

describe('CollectionsService (storefront)', () => {
  let service: CollectionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  describe('findAll', () => {
    it('should return paginated active root categories as tree', async () => {
      const cat1 = {
        id: 'cat-1',
        name: { en: 'Uniforms' },
        slug: 'uniforms',
        sortOrder: 1,
        isActive: true,
        parentId: null,
        children: [],
      };

      mockCategoryRepo.findAndCount.mockResolvedValue([[cat1], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].slug).toBe('uniforms');
    });

    it('should filter by search', async () => {
      mockCategoryRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        search: 'nonexistent',
        page: 1,
        limit: 10,
      });

      expect(result.total).toBe(0);
      expect(mockCategoryRepo.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return category when found', async () => {
      const cat = {
        id: 'cat-1',
        name: { en: 'Uniforms' },
        slug: 'uniforms',
        isActive: true,
        children: [],
        parent: null,
      };

      mockCategoryRepo.findOne.mockResolvedValue(cat);

      const result = await service.findBySlug('uniforms');
      expect(result.slug).toBe('uniforms');
    });

    it('should throw NotFoundException when not found', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProducts', () => {
    it('should return paginated products in category tree', async () => {
      const cat = { id: 'cat-1', slug: 'uniforms', isActive: true };

      mockCategoryRepo.findOne.mockResolvedValue(cat);
      mockCategoryRepo.find.mockResolvedValue([]);

      const qb = mockQueryBuilder();
      qb.getCount.mockResolvedValue(5);
      qb.getRawMany.mockResolvedValue([{ id: 'p-1' }]);
      mockCategoryRepo.manager.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findProducts('uniforms', {
        page: 1,
        limit: 10,
      });

      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid slug', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findProducts('nonexistent', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
