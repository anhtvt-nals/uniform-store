import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { StorageService } from '@app/shared';
import {
  AssetEntity,
  ProductImageEntity,
  ProductEntity,
  CategoryEntity,
  BrandEntity,
} from '@app/database';
import { SignedUrlDto, EntityType } from './dto/signed-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { UploadOptions } from './dto/upload-options.dto';
import {
  AbortMultipartUploadDto,
  CompleteMultipartUploadDto,
  StartMultipartUploadDto,
} from './dto/multipart-upload.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const SIZE_LIMITS: Record<string, number> = {
  product: 5 * 1024 * 1024,
  category: 2 * 1024 * 1024,
  brand: 2 * 1024 * 1024,
};
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MULTIPART_THRESHOLD = 5 * 1024 * 1024;
const MULTIPART_PART_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepo: Repository<ProductImageEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
  ) {}

  async getSignedUploadUrl(dto: SignedUrlDto) {
    this.validateImage(dto.filename, dto.contentType);
    const key = this.createKey(dto.filename, dto.entityType, dto.entityId);

    const maxSize = dto.entityType
      ? SIZE_LIMITS[dto.entityType] || SIZE_LIMITS.product
      : SIZE_LIMITS.product;

    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      '',
      key,
      3600,
      dto.contentType,
      maxSize,
    );
    // Store only key in DB, build URL at runtime
    const publicUrl = this.storageService.buildPublicUrl(key);

    return { uploadUrl, publicUrl, key };
  }

  async startMultipartUpload(dto: StartMultipartUploadDto) {
    this.validateImage(dto.filename, dto.contentType);
    if (dto.size <= MULTIPART_THRESHOLD || dto.size > MAX_UPLOAD_SIZE) {
      throw new BadRequestException('Multipart upload only supports images larger than 5 MB and up to 10 MB.');
    }

    const key = this.createKey(dto.filename, dto.entityType, dto.entityId);
    const uploadId = await this.storageService.createMultipartUpload('', key, dto.contentType);
    const partCount = Math.ceil(dto.size / MULTIPART_PART_SIZE);
    const parts = await Promise.all(
      Array.from({length: partCount}, async (_, index) => ({
        partNumber: index + 1,
        uploadUrl: await this.storageService.getPresignedUploadPartUrl('', key, uploadId, index + 1),
      })),
    );

    return {key, uploadId, partSize: MULTIPART_PART_SIZE, parts};
  }

  async completeMultipartUpload(dto: CompleteMultipartUploadDto) {
    this.validateImage(dto.filename, dto.contentType);
    if (dto.size <= MULTIPART_THRESHOLD || dto.size > MAX_UPLOAD_SIZE) {
      throw new BadRequestException('Invalid multipart upload size.');
    }
    const expectedParts = Math.ceil(dto.size / MULTIPART_PART_SIZE);
    if (dto.parts.length !== expectedParts || dto.parts.some((part, index) => part.partNumber !== index + 1)) {
      throw new BadRequestException('Multipart upload parts are incomplete.');
    }

    await this.storageService.completeMultipartUpload('', dto.key, dto.uploadId, dto.parts.map((part) => ({PartNumber: part.partNumber, ETag: part.etag})));
    return this.persistUploadedAsset({
      key: dto.key,
      filename: dto.filename,
      mimetype: dto.contentType,
      size: dto.size,
      entityType: dto.entityType,
      entityId: dto.entityId,
      variantId: dto.variantId,
    });
  }

  async abortMultipartUpload(dto: AbortMultipartUploadDto) {
    await this.storageService.abortMultipartUpload('', dto.key, dto.uploadId);
    return {message: 'Multipart upload aborted'};
  }

  async confirmUpload(dto: ConfirmUploadDto) {
    // Store only key in database, URL will be built at runtime by interceptor
    const key = dto.key;

    switch (dto.entityType) {
      case EntityType.PRODUCT: {
        const image = this.productImageRepo.create({
          productId: dto.entityId,
          url: key,
          alt: dto.alt ?? {},
          variantId: dto.variantId ?? null,
        });
        await this.productImageRepo.save(image);
        break;
      }
      case EntityType.CATEGORY: {
        const category = await this.categoryRepo.findOne({
          where: { id: dto.entityId },
        });
        if (!category) {
          throw new NotFoundException(`Category not found: ${dto.entityId}`);
        }
        category.imageUrl = key;
        await this.categoryRepo.save(category);
        break;
      }
      case EntityType.BRAND: {
        const brand = await this.brandRepo.findOne({
          where: { id: dto.entityId },
        });
        if (!brand) {
          throw new NotFoundException(`Brand not found: ${dto.entityId}`);
        }
        brand.logoUrl = key;
        await this.brandRepo.save(brand);
        break;
      }
    }

    // Return key, interceptor will build URL
    return { url: key, entityType: dto.entityType, entityId: dto.entityId };
  }

  async deleteFile(dto: DeleteFileDto) {
    await this.storageService.delete('', dto.key);

    const asset = await this.assetRepo.findOne({
      where: { key: dto.key },
    });
    if (asset) {
      await this.assetRepo.softRemove(asset);
    }

    if (dto.entityType && dto.entityId) {
      switch (dto.entityType) {
        case EntityType.PRODUCT: {
          const image = await this.productImageRepo.findOne({
            where: { url: dto.key },
          });
          if (image) {
            await this.productImageRepo.softRemove(image);
          }
          break;
        }
        case EntityType.CATEGORY: {
          const category = await this.categoryRepo.findOne({
            where: { id: dto.entityId },
          });
          if (category && category.imageUrl === dto.key) {
            category.imageUrl = '';
            await this.categoryRepo.save(category);
          }
          break;
        }
        case EntityType.BRAND: {
          const brand = await this.brandRepo.findOne({
            where: { id: dto.entityId },
          });
          if (brand && brand.logoUrl === dto.key) {
            brand.logoUrl = '';
            await this.brandRepo.save(brand);
          }
          break;
        }
      }
    }

    return { message: 'File deleted successfully' };
  }

  async listAssets(dto: ListAssetsDto) {
    const { search, page = 1, limit = 48 } = dto;
    const where: any = { deletedAt: null };

    if (search) {
      where.filename = Like(`%${search}%`);
    }

    const [items, total] = await this.assetRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = items.map((asset) => ({
      id: asset.id,
      url: asset.url,
      key: asset.key,
      alt: asset.alt,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      createdAt: asset.createdAt,
    }));

    return { items: mapped, total, page, limit };
  }

  async getAsset(id: string) {
    const asset = await this.assetRepo.findOne({
      where: { id },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return {
      id: asset.id,
      url: asset.url,
      key: asset.key,
      alt: asset.alt,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      createdAt: asset.createdAt,
    };
  }

  async uploadFile(file: { buffer: Buffer; originalname: string; mimetype: string }, options: UploadOptions) {
    const key = this.createKey(file.originalname, options.entityType, options.entityId);

    await this.storageService.upload('', key, file.buffer, file.mimetype);
    return this.persistUploadedAsset({
      key,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.buffer.length,
      ...options,
    });
  }

  private validateImage(filename: string, contentType: string) {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(`Content type not allowed: ${contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }
    const typeExts: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'], 'image/gif': ['.gif'], 'image/avif': ['.avif'],
    };
    if (!typeExts[contentType]?.includes(path.extname(filename).toLowerCase())) {
      throw new BadRequestException(`Extension does not match content type ${contentType}`);
    }
  }

  private createKey(filename: string, entityType?: string, entityId?: string) {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return entityType ? `${entityType}s/${entityId || 'unknown'}/${randomUUID()}-${sanitized}` : `uploads/${randomUUID()}-${sanitized}`;
  }

  private async persistUploadedAsset(input: {
    key: string; filename: string; mimetype: string; size: number; entityType?: string; entityId?: string; alt?: Record<string, string>; variantId?: string;
  }) {
    const {key, filename, mimetype, size, entityType, entityId, alt, variantId} = input;
    const publicUrl = this.storageService.buildPublicUrl(key);

    const asset = this.assetRepo.create({
      url: publicUrl,
      key,
      filename,
      mimeType: mimetype,
      size,
      alt: alt ?? {},
    });
    await this.assetRepo.save(asset);

    if (entityType === 'product' && entityId) {
      const image = this.productImageRepo.create({
        productId: entityId,
        url: publicUrl,
        alt: alt ?? {},
        variantId: variantId ?? null,
      });
      await this.productImageRepo.save(image);
      return { image, url: publicUrl, key };
    }

    if (entityType === 'category' && entityId) {
      const category = await this.categoryRepo.findOne({
        where: { id: entityId },
      });
      if (category) {
        category.imageUrl = publicUrl;
        await this.categoryRepo.save(category);
      }
      return { url: publicUrl, key, entityType, entityId };
    }

    if (entityType === 'brand' && entityId) {
      const brand = await this.brandRepo.findOne({ where: { id: entityId } });
      if (brand) {
        brand.logoUrl = publicUrl;
        await this.brandRepo.save(brand);
      }
      return { url: publicUrl, key, entityType, entityId };
    }

    return { url: publicUrl, key };
  }
}
