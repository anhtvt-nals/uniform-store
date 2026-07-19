import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CategoryEntity } from '@app/database';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

const mockCategoryRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  restore: jest.fn(),
  update: jest.fn(),
  manager: {
    createQueryBuilder: jest.fn(),
  },
};

describe('CollectionsService (admin)', () => {
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
    it('should return paginated categories', async () => {
      mockCategoryRepo.findAndCount.mockResolvedValue([
        [{ id: 'cat-1', name: { en: 'Test' }, slug: 'test' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return category when found', async () => {
      const cat = {
        id: 'cat-1',
        name: { en: 'Uniforms' },
        slug: 'uniforms',
        parent: null,
        children: [],
      };
      mockCategoryRepo.findOne.mockResolvedValue(cat);

      const result = await service.findOne('cat-1');
      expect(result.id).toBe('cat-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);
      mockCategoryRepo.create.mockReturnValue({
        id: 'cat-new',
        name: { en: 'New Cat' },
        slug: 'new-cat',
      });
      mockCategoryRepo.save.mockResolvedValue({
        id: 'cat-new',
        name: { en: 'New Cat' },
        slug: 'new-cat',
      });

      const result = await service.create({
        name: { en: 'New Cat' },
        slug: 'new-cat',
      });

      expect(result.id).toBe('cat-new');
    });

    it('should throw ConflictException for duplicate slug', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'existing',
        slug: 'new-cat',
      });

      await expect(
        service.create({
          name: { en: 'New Cat' },
          slug: 'new-cat',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const existing = {
        id: 'cat-1',
        name: { en: 'Old Name' },
        slug: 'old-slug',
        description: {},
        imageUrl: '',
        isActive: true,
        sortOrder: 0,
        parentId: null,
      };

      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.save.mockResolvedValue({
        ...existing,
        name: { en: 'New Name' },
      });

      const result = await service.update('cat-1', {
        name: { en: 'New Name' },
      });

      expect(result.name.en).toBe('New Name');
    });

    it('should throw NotFoundException', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: { en: 'Test' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a category with no children', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'cat-1',
        children: [],
      });
      mockCategoryRepo.softRemove.mockResolvedValue({});

      const result = await service.remove('cat-1');
      expect(result.message).toContain('deleted');
    });

    it('should throw BadRequestException if category has children', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'cat-1',
        children: [{ id: 'child-1' }],
      });

      await expect(service.remove('cat-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted category', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'cat-1',
        deletedAt: new Date(),
      });
      mockCategoryRepo.restore.mockResolvedValue({});

      const result = await service.restore('cat-1');
      expect(result.message).toContain('restored');
    });

    it('should throw if category not found', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.restore('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
