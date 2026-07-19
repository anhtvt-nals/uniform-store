import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In } from 'typeorm';
import {
  ProductEntity,
  ProductVariantEntity,
  ProductImageEntity,
  ProductOptionGroupEntity,
  ProductOptionEntity,
  ProductVariantOptionEntity,
  InventoryEntity,
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
      where.name = ILike(`%${search}%`);
    }

    const order = this.parseSort(sort);

    const [items, total] = await this.productRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category', 'brand'],
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

    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.productRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Slug already exists: ${dto.slug}`);
    }

    const product = this.productRepo.create({
      name: dto.name,
      slug: dto.slug,
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? null,
      description: dto.description ?? {},
      detail: dto.detail ?? {},
      sku: dto.sku ?? '',
      basePrice: dto.basePrice ?? 0,
      taxRate: dto.taxRate ?? 0,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      weight: dto.weight ?? 0,
      metaTitle: dto.metaTitle ?? {},
      metaDesc: dto.metaDesc ?? {},
    });

    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.productRepo.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Slug already exists: ${dto.slug}`);
      }
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.slug !== undefined) product.slug = dto.slug;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.brandId !== undefined) product.brandId = dto.brandId;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.taxRate !== undefined) product.taxRate = dto.taxRate;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.weight !== undefined) product.weight = dto.weight;
    if (dto.metaTitle !== undefined) product.metaTitle = dto.metaTitle;
    if (dto.detail !== undefined) product.detail = dto.detail;
    if (dto.metaDesc !== undefined) product.metaDesc = dto.metaDesc;

    return this.productRepo.save(product);
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

    await this.inventoryRepo.save(
      this.inventoryRepo.create({ variantId: saved.id }),
    );

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

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
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
    if (dto.comparePrice !== undefined)
      variant.comparePrice = dto.comparePrice;
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

  async assignVariantOptions(
    productId: string,
    variantId: string,
    dto: AssignOptionsDto,
  ) {
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

  async updateVariantInventory(
    productId: string,
    variantId: string,
    dto: UpdateInventoryDto,
  ) {
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
    if (dto.lowStockLevel !== undefined)
      inventory.lowStockLevel = dto.lowStockLevel;
    if (dto.trackInventory !== undefined)
      inventory.trackInventory = dto.trackInventory;
    if (dto.allowBackorder !== undefined)
      inventory.allowBackorder = dto.allowBackorder;

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

  async updateOptionGroup(
    productId: string,
    groupId: string,
    dto: UpdateOptionGroupDto,
  ) {
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
