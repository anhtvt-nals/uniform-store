import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  ProductEntity,
  ProductVariantEntity,
  ProductImageEntity,
  ProductOptionGroupEntity,
  ProductOptionEntity,
  ProductVariantOptionEntity,
  InventoryEntity,
  ProductSizeEntity,
} from '@app/database';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { CreateOptionGroupDto } from './dto/create-option-group.dto';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto';
import { AssignOptionsDto } from './dto/assign-options.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly imageRepo: Repository<ProductImageEntity>,
    @InjectRepository(ProductOptionGroupEntity)
    private readonly optionGroupRepo: Repository<ProductOptionGroupEntity>,
    @InjectRepository(ProductOptionEntity)
    private readonly optionRepo: Repository<ProductOptionEntity>,
    @InjectRepository(ProductVariantOptionEntity)
    private readonly variantOptionRepo: Repository<ProductVariantOptionEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(ProductSizeEntity)
    private readonly productSizeRepo: Repository<ProductSizeEntity>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      brandId,
      isActive,
      isFeatured,
      page = 1,
      limit = 20,
      sort,
      includeDeleted,
    } = query;

    const where: FindOptionsWhere<ProductEntity> = {};

    if (isActive !== undefined) where.isActive = isActive;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    if (search) {
      // Product names are localized JSONB values. PostgreSQL cannot apply
      // ILIKE directly to jsonb, so query the Vietnamese value as text.
      where.name = Raw((column) => `(${column} ->> 'vi') ILIKE :search`, {
        search: `%${search}%`,
      });
    }

    const order = this.parseSort(sort);

    const [items, total] = await this.productRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category', 'brand', 'images'],
      withDeleted: includeDeleted ?? false,
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'variants',
        'variants.variantOptions',
        'variants.variantOptions.option',
        'variants.variantOptions.option.group',
        'images',
        'optionGroups',
        'optionGroups.options',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    const sizeLinks = await this.productSizeRepo.find({
      where: { productId: id },
      relations: ['size'],
      order: { size: { sortOrder: 'ASC', code: 'ASC' } },
    });
    return { ...product, sizes: sizeLinks.map((link) => link.size).filter(Boolean) };
  }

  async create(dto: CreateProductDto) {
    const slug = await this.resolveUniqueSlug(dto.slug);

    const product = this.productRepo.create({
      name: dto.name,
      slug,
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? null,
      description: dto.description ?? {},
      sortDescription: dto.sortDescription ?? dto.description ?? {},
      detail: dto.detail ?? {},
      sku: dto.sku ?? '',
      basePrice: dto.isContactPrice ? 0 : (dto.basePrice ?? 0),
      isContactPrice: dto.isContactPrice ?? false,
      taxRate: dto.taxRate ?? 0,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      weight: dto.weight ?? 0,
      metaTitle: dto.metaTitle ?? {},
      metaDesc: dto.metaDesc ?? {},
      sizeGuideImageUrl: dto.sizeGuideImageUrl ?? '',
    });

    const saved = await this.productRepo.save(product);
    await this.replaceSizes(saved.id, dto.sizeIds);
    return saved;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.slug !== undefined && dto.slug !== product.slug) {
      product.slug = await this.resolveUniqueSlug(dto.slug, product.id);
    }
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.brandId !== undefined) product.brandId = dto.brandId;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.sortDescription !== undefined) product.sortDescription = dto.sortDescription;
    else if (dto.description !== undefined) product.sortDescription = dto.description;
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.isContactPrice !== undefined) product.isContactPrice = dto.isContactPrice;
    if (product.isContactPrice) product.basePrice = 0;
    else if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.taxRate !== undefined) product.taxRate = dto.taxRate;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.weight !== undefined) product.weight = dto.weight;
    if (dto.metaTitle !== undefined) product.metaTitle = dto.metaTitle;
    if (dto.detail !== undefined) product.detail = dto.detail;
    if (dto.metaDesc !== undefined) product.metaDesc = dto.metaDesc;
    if (dto.sizeGuideImageUrl !== undefined) product.sizeGuideImageUrl = dto.sizeGuideImageUrl;

    const saved = await this.productRepo.save(product);
    if (dto.sizeIds !== undefined) await this.replaceSizes(saved.id, dto.sizeIds);
    return saved;
  }

  async duplicate(id: string) {
    const source = await this.productRepo.findOne({
      where: { id },
      relations: [
        'variants',
        'variants.variantOptions',
        'images',
        'optionGroups',
        'optionGroups.options',
      ],
    });
    if (!source) throw new NotFoundException(`Product not found: ${id}`);

    const sourceSizes = await this.productSizeRepo.find({ where: { productId: id } });
    const sourceInventory = source.variants?.length
      ? await this.inventoryRepo.find({
          where: { variantId: In(source.variants.map((variant) => variant.id)) },
        })
      : [];
    const inventoryByVariantId = new Map(
      sourceInventory.map((inventory) => [inventory.variantId, inventory]),
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepo = queryRunner.manager.getRepository(ProductEntity);
      const copiedProduct = productRepo.create({
        categoryId: source.categoryId,
        brandId: source.brandId,
        name: this.copyLocalizedName(source.name),
        slug: await this.resolveUniqueSlug(`${source.slug}-copy`),
        description: source.description,
        sortDescription: source.sortDescription,
        detail: source.detail,
        sku: source.sku ? `${source.sku}-COPY` : '',
        basePrice: source.isContactPrice ? 0 : Number(source.basePrice),
        isContactPrice: source.isContactPrice,
        taxRate: Number(source.taxRate),
        isActive: source.isActive,
        isFeatured: false,
        weight: Number(source.weight),
        metaTitle: source.metaTitle,
        metaDesc: source.metaDesc,
        sizeGuideImageUrl: source.sizeGuideImageUrl,
      });
      const savedProduct = await productRepo.save(copiedProduct);

      const copiedOptionIds = new Map<string, string>();
      for (const group of source.optionGroups ?? []) {
        const copiedGroup = await queryRunner.manager.save(ProductOptionGroupEntity, {
          productId: savedProduct.id,
          name: group.name,
          sortOrder: group.sortOrder,
        });
        for (const option of group.options ?? []) {
          const copiedOption = await queryRunner.manager.save(ProductOptionEntity, {
            groupId: copiedGroup.id,
            name: option.name,
            value: option.value,
            sortOrder: option.sortOrder,
          });
          copiedOptionIds.set(option.id, copiedOption.id);
        }
      }

      const copiedVariantIds = new Map<string, string>();
      for (const variant of source.variants ?? []) {
        const copiedVariant = await queryRunner.manager.save(ProductVariantEntity, {
          productId: savedProduct.id,
          name: variant.name,
          sku: this.createCopiedSku(variant.sku),
          barcode: variant.barcode,
          price: Number(variant.price),
          comparePrice: variant.comparePrice,
          taxRate: Number(variant.taxRate),
          weight: Number(variant.weight),
          isActive: variant.isActive,
          sortOrder: variant.sortOrder,
        });
        copiedVariantIds.set(variant.id, copiedVariant.id);

        const inventory = inventoryByVariantId.get(variant.id);
        await queryRunner.manager.save(InventoryEntity, {
          variantId: copiedVariant.id,
          quantity: 0,
          reserved: 0,
          lowStockLevel: inventory?.lowStockLevel ?? 5,
          trackInventory: inventory?.trackInventory ?? true,
          allowBackorder: inventory?.allowBackorder ?? false,
        });

        const optionLinks = (variant.variantOptions ?? [])
          .map((link) => copiedOptionIds.get(link.optionId))
          .filter((optionId): optionId is string => Boolean(optionId));
        if (optionLinks.length) {
          await queryRunner.manager.save(
            ProductVariantOptionEntity,
            optionLinks.map((optionId) => ({ variantId: copiedVariant.id, optionId })),
          );
        }
      }

      for (const image of source.images ?? []) {
        await queryRunner.manager.save(ProductImageEntity, {
          productId: savedProduct.id,
          variantId: image.variantId ? (copiedVariantIds.get(image.variantId) ?? null) : null,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
        });
      }
      if (sourceSizes.length) {
        await queryRunner.manager.save(
          ProductSizeEntity,
          sourceSizes.map((link) => ({ productId: savedProduct.id, sizeId: link.sizeId })),
        );
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async replaceSizes(productId: string, sizeIds: string[] = []) {
    await this.productSizeRepo.delete({ productId });
    if (sizeIds.length)
      await this.productSizeRepo.save(
        sizeIds.map((sizeId) => this.productSizeRepo.create({ productId, sizeId })),
      );
  }

  private async resolveUniqueSlug(
    requestedSlug: string,
    excludeProductId?: string,
  ): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const slug =
        attempt === 0
          ? requestedSlug
          : `${requestedSlug}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
      const existing = await this.productRepo.findOne({ where: { slug }, withDeleted: true });
      if (!existing || existing.id === excludeProductId) return slug;
    }
    throw new ConflictException('Không thể tạo slug duy nhất. Vui lòng thử lại.');
  }

  private copyLocalizedName(name: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(name).map(([locale, value]) => [locale, `${value} - Copy`]),
    );
  }

  private createCopiedSku(sku: string): string {
    const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    return `${sku || 'SKU'}-COPY-${suffix}`;
  }

  async remove(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    await this.productRepo.softRemove(product);
    return { message: 'Product deleted successfully' };
  }

  async restore(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    if (!product.deletedAt) {
      throw new BadRequestException('Product is not deleted');
    }
    await this.productRepo.restore(id);
    return { message: 'Product restored successfully' };
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }

    const existing = await this.variantRepo.findOne({
      where: { sku: dto.sku },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Variant SKU already exists: ${dto.sku}`);
    }

    const variant = this.variantRepo.create({
      productId,
      name: dto.name,
      sku: dto.sku,
      barcode: dto.barcode ?? '',
      price: dto.price,
      comparePrice: dto.comparePrice ?? null,
      taxRate: dto.taxRate ?? 0,
      weight: dto.weight ?? 0,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.variantRepo.save(variant);

    await this.inventoryRepo.save(this.inventoryRepo.create({ variantId: saved.id }));

    if (dto.optionIds?.length) {
      const options = await this.optionRepo.findBy({
        id: In(dto.optionIds),
      });
      if (options.length !== dto.optionIds.length) {
        throw new BadRequestException('One or more option IDs are invalid');
      }
      const joins = dto.optionIds.map((optionId) =>
        this.variantOptionRepo.create({ variantId: saved.id, optionId }),
      );
      await this.variantOptionRepo.save(joins);
    }

    return this.variantRepo.findOne({
      where: { id: saved.id },
      relations: ['variantOptions', 'variantOptions.option', 'variantOptions.option.group'],
    });
  }

  async updateVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    if (dto.sku && dto.sku !== variant.sku) {
      const existing = await this.variantRepo.findOne({
        where: { sku: dto.sku },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`SKU already exists: ${dto.sku}`);
      }
    }

    if (dto.name !== undefined) variant.name = dto.name;
    if (dto.sku !== undefined) variant.sku = dto.sku;
    if (dto.barcode !== undefined) variant.barcode = dto.barcode;
    if (dto.price !== undefined) variant.price = dto.price;
    if (dto.comparePrice !== undefined) variant.comparePrice = dto.comparePrice;
    if (dto.taxRate !== undefined) variant.taxRate = dto.taxRate;
    if (dto.weight !== undefined) variant.weight = dto.weight;
    if (dto.isActive !== undefined) variant.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) variant.sortOrder = dto.sortOrder;

    return this.variantRepo.save(variant);
  }

  async removeVariant(productId: string, variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    await this.inventoryRepo.delete({ variantId });
    await this.variantOptionRepo.delete({ variantId });
    await this.variantRepo.softRemove(variant);
    return { message: 'Variant deleted successfully' };
  }

  async assignVariantOptions(productId: string, variantId: string, dto: AssignOptionsDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const options = await this.optionRepo.findBy({
      id: In(dto.optionIds),
    });
    if (options.length !== dto.optionIds.length) {
      throw new BadRequestException('One or more option IDs are invalid');
    }

    await this.variantOptionRepo.delete({ variantId });

    const joins = dto.optionIds.map((optionId) =>
      this.variantOptionRepo.create({ variantId, optionId }),
    );
    await this.variantOptionRepo.save(joins);

    return this.variantOptionRepo.find({
      where: { variantId },
      relations: ['option', 'option.group'],
    });
  }

  async getVariantOptions(productId: string, variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    return this.variantOptionRepo.find({
      where: { variantId },
      relations: ['option', 'option.group'],
    });
  }

  async getVariantInventory(productId: string, variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory not found for variant: ${variantId}`);
    }

    return inventory;
  }

  async updateVariantInventory(productId: string, variantId: string, dto: UpdateInventoryDto) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant not found: ${variantId}`);
    }

    let inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });

    if (!inventory) {
      inventory = this.inventoryRepo.create({ variantId });
    }

    if (dto.quantity !== undefined) inventory.quantity = dto.quantity;
    if (dto.reserved !== undefined) inventory.reserved = dto.reserved;
    if (dto.lowStockLevel !== undefined) inventory.lowStockLevel = dto.lowStockLevel;
    if (dto.trackInventory !== undefined) inventory.trackInventory = dto.trackInventory;
    if (dto.allowBackorder !== undefined) inventory.allowBackorder = dto.allowBackorder;

    return this.inventoryRepo.save(inventory);
  }

  async addImage(productId: string, dto: CreateImageDto) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }

    const image = this.imageRepo.create({
      productId,
      url: dto.url,
      alt: dto.alt ?? {},
      variantId: dto.variantId ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.imageRepo.save(image);
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.imageRepo.findOne({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw new NotFoundException(`Image not found: ${imageId}`);
    }
    await this.imageRepo.softRemove(image);
    return { message: 'Image deleted successfully' };
  }

  async addOptionGroup(productId: string, dto: CreateOptionGroupDto) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product not found: ${productId}`);
    }

    const group = this.optionGroupRepo.create({
      productId,
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.optionGroupRepo.save(group);
  }

  async updateOptionGroup(productId: string, groupId: string, dto: UpdateOptionGroupDto) {
    const group = await this.optionGroupRepo.findOne({
      where: { id: groupId, productId },
    });
    if (!group) {
      throw new NotFoundException(`Option group not found: ${groupId}`);
    }

    if (dto.name !== undefined) group.name = dto.name;
    if (dto.sortOrder !== undefined) group.sortOrder = dto.sortOrder;

    return this.optionGroupRepo.save(group);
  }

  async removeOptionGroup(productId: string, groupId: string) {
    const group = await this.optionGroupRepo.findOne({
      where: { id: groupId, productId },
    });
    if (!group) {
      throw new NotFoundException(`Option group not found: ${groupId}`);
    }

    await this.optionGroupRepo.remove(group);
    return { message: 'Option group deleted successfully' };
  }

  private parseSort(sort?: string): Record<string, 'ASC' | 'DESC'> {
    if (!sort) return { createdAt: 'DESC' };
    const parts = sort.split(':');
    const field = parts[0] || 'createdAt';
    const dir = parts[1]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return { [field]: dir };
  }
}
