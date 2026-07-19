import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';
import { StorageService } from '@app/shared';
import {
  ProductImageEntity,
  CategoryEntity,
  BrandEntity,
} from '@app/database';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityType } from './dto/signed-url.dto';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('UploadsService', () => {
  let service: UploadsService;
  let mockStorageService: Record<string, jest.Mock>;
  let mockProductImageRepo: ReturnType<typeof createMockRepo>;
  let mockCategoryRepo: ReturnType<typeof createMockRepo>;
  let mockBrandRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockStorageService = {
      getPresignedUploadUrl: jest.fn(),
      buildPublicUrl: jest.fn(),
      delete: jest.fn(),
    };
    mockProductImageRepo = createMockRepo([
      'create', 'save', 'findOne', 'softRemove',
    ]);
    mockCategoryRepo = createMockRepo(['findOne', 'save']);
    mockBrandRepo = createMockRepo(['findOne', 'save']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: getRepositoryToken(ProductImageEntity), useValue: mockProductImageRepo },
        { provide: getRepositoryToken(CategoryEntity), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(BrandEntity), useValue: mockBrandRepo },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  describe('getSignedUploadUrl', () => {
    it('should return signed URL and public URL for valid image', async () => {
      mockStorageService.getPresignedUploadUrl.mockResolvedValue(
        'https://s3.example.com/upload-url',
      );
      mockStorageService.buildPublicUrl.mockReturnValue(
        'https://cdn.example.com/products/p-1/uuid-photo.jpg',
      );

      const result = await service.getSignedUploadUrl({
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.uploadUrl).toBe('https://s3.example.com/upload-url');
      expect(result.publicUrl).toBe('https://cdn.example.com/products/p-1/uuid-photo.jpg');
      expect(result.key).toContain('uploads/');
      expect(result.key).toMatch(/\.jpg$/);
    });

    it('should generate correct key prefix when entity type is provided', async () => {
      mockStorageService.getPresignedUploadUrl.mockResolvedValue('url');
      mockStorageService.buildPublicUrl.mockReturnValue('url');

      const result = await service.getSignedUploadUrl({
        filename: 'logo.png',
        contentType: 'image/png',
        entityType: EntityType.BRAND,
        entityId: 'brand-123',
      });

      expect(result.key).toMatch(/^brands\/brand-123\//);
    });

    it('should throw BadRequestException for invalid content type', async () => {
      await expect(
        service.getSignedUploadUrl({
          filename: 'file.pdf',
          contentType: 'application/pdf',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for extension mismatch', async () => {
      await expect(
        service.getSignedUploadUrl({
          filename: 'photo.png',
          contentType: 'image/jpeg',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmUpload', () => {
    it('should create a product image record', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue(
        'https://cdn.example.com/products/p-1/img.jpg',
      );
      mockProductImageRepo.create.mockReturnValue({
        productId: 'p-1',
        url: 'https://cdn.example.com/products/p-1/img.jpg',
        alt: { en: 'Product image' },
        variantId: null,
      });
      mockProductImageRepo.save.mockResolvedValue({
        id: 'img-1',
        productId: 'p-1',
        url: 'https://cdn.example.com/products/p-1/img.jpg',
      });

      const result = await service.confirmUpload({
        key: 'products/p-1/img.jpg',
        entityType: EntityType.PRODUCT,
        entityId: 'p-1',
        alt: { en: 'Product image' },
      });

      expect(result.url).toBe('https://cdn.example.com/products/p-1/img.jpg');
      expect(mockProductImageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'p-1',
          alt: { en: 'Product image' },
        }),
      );
    });

    it('should create product image with variant link', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue('url');
      mockProductImageRepo.create.mockReturnValue({});
      mockProductImageRepo.save.mockResolvedValue({});

      await service.confirmUpload({
        key: 'products/p-1/img.jpg',
        entityType: EntityType.PRODUCT,
        entityId: 'p-1',
        variantId: 'v-1',
      });

      expect(mockProductImageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ variantId: 'v-1' }),
      );
    });

    it('should update category imageUrl', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue(
        'https://cdn.example.com/categories/c-1/cat.jpg',
      );
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'c-1',
        imageUrl: '',
      });
      mockCategoryRepo.save.mockResolvedValue({});

      const result = await service.confirmUpload({
        key: 'categories/c-1/cat.jpg',
        entityType: EntityType.CATEGORY,
        entityId: 'c-1',
      });

      expect(result.url).toBe('https://cdn.example.com/categories/c-1/cat.jpg');
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://cdn.example.com/categories/c-1/cat.jpg',
        }),
      );
    });

    it('should update brand logoUrl', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue(
        'https://cdn.example.com/brands/b-1/logo.png',
      );
      mockBrandRepo.findOne.mockResolvedValue({
        id: 'b-1',
        logoUrl: '',
      });
      mockBrandRepo.save.mockResolvedValue({});

      const result = await service.confirmUpload({
        key: 'brands/b-1/logo.png',
        entityType: EntityType.BRAND,
        entityId: 'b-1',
      });

      expect(result.url).toBe('https://cdn.example.com/brands/b-1/logo.png');
      expect(mockBrandRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          logoUrl: 'https://cdn.example.com/brands/b-1/logo.png',
        }),
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue('url');
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.confirmUpload({
          key: 'categories/c-1/img.jpg',
          entityType: EntityType.CATEGORY,
          entityId: 'c-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if brand not found', async () => {
      mockStorageService.buildPublicUrl.mockReturnValue('url');
      mockBrandRepo.findOne.mockResolvedValue(null);

      await expect(
        service.confirmUpload({
          key: 'brands/b-1/logo.png',
          entityType: EntityType.BRAND,
          entityId: 'b-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    it('should delete from S3 and soft-remove product image', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);
      mockStorageService.buildPublicUrl.mockReturnValue('public-url');
      mockProductImageRepo.findOne.mockResolvedValue({
        id: 'img-1',
        url: 'public-url',
      });
      mockProductImageRepo.softRemove.mockResolvedValue({});

      const result = await service.deleteFile({
        key: 'products/p-1/img.jpg',
        entityType: EntityType.PRODUCT,
        entityId: 'p-1',
      });

      expect(mockStorageService.delete).toHaveBeenCalledWith('', 'products/p-1/img.jpg');
      expect(mockProductImageRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { url: 'public-url' } }),
      );
      expect(result.message).toContain('deleted');
    });

    it('should delete from S3 and clear category imageUrl', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);
      mockStorageService.buildPublicUrl.mockReturnValue('public-url');
      mockCategoryRepo.findOne.mockResolvedValue({
        id: 'c-1',
        imageUrl: 'public-url',
      });
      mockCategoryRepo.save.mockResolvedValue({});

      const result = await service.deleteFile({
        key: 'categories/c-1/img.jpg',
        entityType: EntityType.CATEGORY,
        entityId: 'c-1',
      });

      expect(mockCategoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: '' }),
      );
      expect(result.message).toContain('deleted');
    });

    it('should delete from S3 and clear brand logoUrl', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);
      mockStorageService.buildPublicUrl.mockReturnValue('public-url');
      mockBrandRepo.findOne.mockResolvedValue({
        id: 'b-1',
        logoUrl: 'public-url',
      });
      mockBrandRepo.save.mockResolvedValue({});

      const result = await service.deleteFile({
        key: 'brands/b-1/logo.png',
        entityType: EntityType.BRAND,
        entityId: 'b-1',
      });

      expect(mockBrandRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ logoUrl: '' }),
      );
      expect(result.message).toContain('deleted');
    });

    it('should delete from S3 even without entity info', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);

      const result = await service.deleteFile({
        key: 'orphans/file.jpg',
      });

      expect(mockStorageService.delete).toHaveBeenCalledWith('', 'orphans/file.jpg');
      expect(result.message).toContain('deleted');
    });
  });
});
