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
    if (!ALLOWED_MIME_TYPES.includes(dto.contentType)) {
      throw new BadRequestException(
        `Content type not allowed: ${dto.contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const ext = path.extname(dto.filename).toLowerCase();
    const typeExts: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/avif': ['.avif'],
    };
    if (!typeExts[dto.contentType]?.includes(ext)) {
      throw new BadRequestException(
        `Extension ${ext} does not match content type ${dto.contentType}`,
      );
    }

    const uuid = randomUUID();
    const sanitized = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = dto.entityType
      ? `${dto.entityType}s/${dto.entityId || 'unknown'}/${uuid}-${sanitized}`
      : `uploads/${uuid}-${sanitized}`;

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
    const publicUrl = this.storageService.buildPublicUrl(key);

    return { uploadUrl, publicUrl, key };
  }

  async confirmUpload(dto: ConfirmUploadDto) {
    const publicUrl = this.storageService.buildPublicUrl(dto.key);

    switch (dto.entityType) {
      case EntityType.PRODUCT: {
        const image = this.productImageRepo.create({
          productId: dto.entityId,
          url: publicUrl,
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
        category.imageUrl = publicUrl;
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
        brand.logoUrl = publicUrl;
        await this.brandRepo.save(brand);
        break;
      }
    }

    return { url: publicUrl, entityType: dto.entityType, entityId: dto.entityId };
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
          const publicUrl = this.storageService.buildPublicUrl(dto.key);
          const image = await this.productImageRepo.findOne({
            where: { url: publicUrl },
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
          if (category && category.imageUrl === this.storageService.buildPublicUrl(dto.key)) {
            category.imageUrl = '';
            await this.categoryRepo.save(category);
          }
          break;
        }
        case EntityType.BRAND: {
          const brand = await this.brandRepo.findOne({
            where: { id: dto.entityId },
          });
          if (brand && brand.logoUrl === this.storageService.buildPublicUrl(dto.key)) {
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
    const { entityType, entityId, alt, variantId } = options;

    const ext = path.extname(file.originalname).toLowerCase();
    const uuid = randomUUID();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = entityType
      ? `${entityType}s/${entityId || 'unknown'}/${uuid}-${sanitized}`
      : `uploads/${uuid}-${sanitized}`;

    await this.storageService.upload('', key, file.buffer, file.mimetype);
    const publicUrl = this.storageService.buildPublicUrl(key);

    const asset = this.assetRepo.create({
      url: publicUrl,
      key,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.buffer.length,
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
