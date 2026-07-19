import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductEntity, CategoryEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

const mockProductRepo = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
};

function mockQb(overrides: any = {}) {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    ...overrides,
  };
  qb.clone = jest.fn().mockReturnValue(qb);
  return qb;
}

describe('ProductsService (storefront)', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductRepo },
        { provide: getRepositoryToken(CategoryEntity), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated active products', async () => {
      const qb = mockQb();
      qb.getCount.mockResolvedValue(2);
      qb.getMany.mockResolvedValue([
        { id: 'p-1', name: { en: 'Shirt' }, images: [] },
        { id: 'p-2', name: { en: 'Pants' }, images: [] },
      ]);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should filter by search', async () => {
      const qb = mockQb();
      qb.getCount.mockResolvedValue(0);
      qb.getMany.mockResolvedValue([]);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        search: 'nonexistent',
        page: 1,
        limit: 12,
      });

      expect(result.total).toBe(0);
    });

    it('should filter by category slug', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'cat-1',
        slug: 'uniforms',
        isActive: true,
      });
      mockCategoryRepo.find.mockResolvedValue([]);

      const qb = mockQb();
      qb.getCount.mockResolvedValue(1);
      qb.getMany.mockResolvedValue([{ id: 'p-1', images: [] }]);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        categorySlug: 'uniforms',
        page: 1,
        limit: 12,
      });

      expect(result.total).toBe(1);
    });

    it('should filter by isFeatured', async () => {
      const qb = mockQb();
      qb.getCount.mockResolvedValue(3);
      qb.getMany.mockResolvedValue([
        { id: 'p-1', images: [] },
        { id: 'p-2', images: [] },
        { id: 'p-3', images: [] },
      ]);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        isFeatured: true,
        page: 1,
        limit: 12,
      });

      expect(result.total).toBe(3);
    });

    it('should filter by price range', async () => {
      const qb = mockQb();
      qb.getCount.mockResolvedValue(1);
      qb.getMany.mockResolvedValue([{ id: 'p-1', images: [] }]);
      mockProductRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        minPrice: 100000,
        maxPrice: 500000,
        page: 1,
        limit: 12,
      });

      expect(result.total).toBe(1);
    });
  });

  describe('findBySlug', () => {
    it('should return product with relations', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'p-1',
        slug: 'uniform-shirt',
        isActive: true,
        variants: [{ id: 'v-1', isActive: true, sortOrder: 0 }],
        images: [],
        optionGroups: [],
      });

      const result = await service.findBySlug('uniform-shirt');
      expect(result.slug).toBe('uniform-shirt');
      expect(result.variants).toHaveLength(1);
    });

    it('should throw NotFoundException', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findVariants', () => {
    it('should return variants with images', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'p-1',
        slug: 'uniform-shirt',
        isActive: true,
        variants: [
          { id: 'v-1', isActive: true, sortOrder: 0 },
          { id: 'v-2', isActive: true, sortOrder: 1 },
        ],
        images: [
          { id: 'i-1', variantId: 'v-1' },
          { id: 'i-2', variantId: null },
        ],
      });

      const result = await service.findVariants('uniform-shirt');
      expect(result).toHaveLength(2);
      expect(result[0].images).toHaveLength(2);
    });
  });

  describe('findRelated', () => {
    it('should return related products', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'p-1',
        categoryId: 'cat-1',
        isActive: true,
      });
      mockProductRepo.find.mockResolvedValue([
        { id: 'p-2', images: [] },
        { id: 'p-3', images: [] },
      ]);

      const result = await service.findRelated('uniform-shirt', 4);
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException for invalid slug', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.findRelated('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findFeatured', () => {
    it('should return featured products', async () => {
      mockProductRepo.find.mockResolvedValue([
        { id: 'p-1', isFeatured: true, images: [] },
      ]);

      const result = await service.findFeatured(8);
      expect(result).toHaveLength(1);
    });
  });
});
