import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BrandsService } from './brands.service';
import { BrandEntity } from '@app/database';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

const mockBrandRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  restore: jest.fn(),
  manager: {
    createQueryBuilder: jest.fn(),
  },
};

describe('BrandsService (admin)', () => {
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
    it('should return paginated brands', async () => {
      mockBrandRepo.findAndCount.mockResolvedValue([
        [{ id: 'b-1', name: { en: 'Minh An' }, slug: 'minh-an' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return brand when found', async () => {
      mockBrandRepo.findOne.mockResolvedValue({
        id: 'b-1',
        name: { en: 'Minh An' },
      });

      const result = await service.findOne('b-1');
      expect(result.id).toBe('b-1');
    });

    it('should throw NotFoundException', async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a brand', async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);
      mockBrandRepo.create.mockReturnValue({
        id: 'b-new',
        name: { en: 'New Brand' },
        slug: 'new-brand',
      });
      mockBrandRepo.save.mockResolvedValue({
        id: 'b-new',
        name: { en: 'New Brand' },
        slug: 'new-brand',
      });

      const result = await service.create({
        name: { en: 'New Brand' },
        slug: 'new-brand',
      });

      expect(result.id).toBe('b-new');
    });

    it('should throw ConflictException for duplicate slug', async () => {
      mockBrandRepo.findOne.mockResolvedValue({ id: 'existing', slug: 'dup' });

      await expect(
        service.create({ name: { en: 'Test' }, slug: 'dup' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a brand', async () => {
      const existing = {
        id: 'b-1',
        name: { en: 'Old' },
        slug: 'old',
        description: {},
        logoUrl: '',
        websiteUrl: '',
        isActive: true,
        sortOrder: 0,
      };

      mockBrandRepo.findOne.mockResolvedValue(existing);
      mockBrandRepo.save.mockResolvedValue({
        ...existing,
        name: { en: 'Updated' },
      });

      const result = await service.update('b-1', {
        name: { en: 'Updated' },
      });

      expect(result.name.en).toBe('Updated');
    });

    it('should throw NotFoundException', async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { name: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete brand with no products', async () => {
      mockBrandRepo.findOne.mockResolvedValue({ id: 'b-1' });
      const qb = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      mockBrandRepo.manager.createQueryBuilder.mockReturnValue(qb);
      mockBrandRepo.softRemove.mockResolvedValue({});

      const result = await service.remove('b-1');
      expect(result.message).toContain('deleted');
    });

    it('should throw BadRequestException if brand has products', async () => {
      mockBrandRepo.findOne.mockResolvedValue({ id: 'b-1' });
      const qb = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };
      mockBrandRepo.manager.createQueryBuilder.mockReturnValue(qb);

      await expect(service.remove('b-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('restore', () => {
    it('should restore deleted brand', async () => {
      mockBrandRepo.findOne.mockResolvedValue({
        id: 'b-1',
        deletedAt: new Date(),
      });
      mockBrandRepo.restore.mockResolvedValue({});

      const result = await service.restore('b-1');
      expect(result.message).toContain('restored');
    });
  });

  describe('updateLogo', () => {
    it('should update logo URL', async () => {
      const brand = { id: 'b-1', logoUrl: '' };
      mockBrandRepo.findOne.mockResolvedValue(brand);
      mockBrandRepo.save.mockResolvedValue({
        ...brand,
        logoUrl: 'https://example.com/logo.png',
      });

      const result = await service.updateLogo('b-1', {
        logoUrl: 'https://example.com/logo.png',
      });

      expect(result.logoUrl).toBe('https://example.com/logo.png');
    });
  });
});
