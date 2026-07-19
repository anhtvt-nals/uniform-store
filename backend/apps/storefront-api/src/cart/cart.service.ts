import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  ProductVariantEntity,
  InventoryEntity,
} from '@app/database';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(CartCouponEntity)
    private readonly cartCouponRepo: Repository<CartCouponEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
  ) {}

  async getCart(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    return this.buildCartResponse(cart);
  }

  async addItem(dto: AddItemDto, userId?: string, sessionId?: string) {
    const variantId = await this.resolveVariantId(dto.productId, dto.variantId);
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
      relations: ['product'],
    });
    if (!variant || variant.isActive === false) {
      throw new BadRequestException('Variant not found or inactive');
    }

    await this.validateStock(variantId, dto.quantity);

    const cart = await this.findOrCreateCart(userId, sessionId);
    const existingItem = await this.cartItemRepo.findOne({
      where: { cartId: cart.id, variantId },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      await this.validateStock(variantId, newQty);
      await this.cartItemRepo.update(existingItem.id, {
        quantity: newQty,
      });
    } else {
      const item = this.cartItemRepo.create({
        cartId: cart.id,
        variantId,
        quantity: dto.quantity,
        unitPrice: variant.price,
      });
      await this.cartItemRepo.save(item);
    }

    return this.buildCartResponse(cart);
  }

  async updateItem(
    lineId: string,
    dto: UpdateItemDto,
    userId?: string,
    sessionId?: string,
  ) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const item = await this.cartItemRepo.findOne({
      where: { id: lineId, cartId: cart.id },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity !== undefined) {
      if (dto.quantity < 1) {
        await this.cartItemRepo.remove(item);
      } else {
        await this.validateStock(item.variantId, dto.quantity);
        await this.cartItemRepo.update(item.id, { quantity: dto.quantity });
      }
    }

    return this.buildCartResponse(cart);
  }

  async removeItem(lineId: string, userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const item = await this.cartItemRepo.findOne({
      where: { id: lineId, cartId: cart.id },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemRepo.remove(item);
    return this.buildCartResponse(cart);
  }

  async addCoupon(
    code: string,
    userId?: string,
    sessionId?: string,
  ) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const coupon = this.cartCouponRepo.create({
      cartId: cart.id,
      couponCode: code,
      discountAmount: 0,
    });
    await this.cartCouponRepo.save(coupon);
    return this.buildCartResponse(cart);
  }

  async removeCoupon(
    code: string,
    userId?: string,
    sessionId?: string,
  ) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const coupon = await this.cartCouponRepo.findOne({
      where: { cartId: cart.id, couponCode: code },
    });
    if (coupon) {
      await this.cartCouponRepo.remove(coupon);
    }
    return this.buildCartResponse(cart);
  }

  async mergeCart(userId: string, sessionId: string) {
    const sessionCart = await this.cartRepo.findOne({
      where: { sessionId, status: 'active' },
      relations: ['items'],
    });

    const userCart = await this.cartRepo.findOne({
      where: { userId, status: 'active' },
      relations: ['items'],
    });

    if (!sessionCart || !sessionCart.items?.length) {
      return this.getCart(userId);
    }

    const target = userCart ?? await this.cartRepo.save(
      this.cartRepo.create({ userId, status: 'active' }),
    );

    for (const sessionItem of sessionCart.items) {
      const existing = target.items?.find(
        (i) => i.variantId === sessionItem.variantId,
      );
      if (existing) {
        await this.cartItemRepo.update(existing.id, {
          quantity: existing.quantity + sessionItem.quantity,
        });
      } else {
        await this.cartItemRepo.save(
          this.cartItemRepo.create({
            cartId: target.id,
            variantId: sessionItem.variantId,
            quantity: sessionItem.quantity,
            unitPrice: sessionItem.unitPrice,
          }),
        );
      }
    }

    await this.cartRepo.update(sessionCart.id, { status: 'converted' });
    return this.getCart(userId);
  }

  private async findOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await this.cartRepo.findOne({
        where: { userId, status: 'active' },
      });
      if (!cart) {
        cart = this.cartRepo.create({ userId, status: 'active' });
        cart = await this.cartRepo.save(cart);
      }
      return cart;
    }

    if (sessionId) {
      let cart = await this.cartRepo.findOne({
        where: { sessionId, status: 'active' },
      });
      if (!cart) {
        cart = this.cartRepo.create({ sessionId, status: 'active' });
        cart = await this.cartRepo.save(cart);
      }
      return cart;
    }

    throw new BadRequestException('User authentication or session ID required');
  }

  private async resolveVariantId(
    productId: string,
    variantId?: string,
  ): Promise<string> {
    if (variantId) return variantId;

    const variant = await this.variantRepo.findOne({
      where: { productId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
    if (!variant) {
      throw new BadRequestException(
        `No active variants found for product: ${productId}`,
      );
    }
    return variant.id;
  }

  private async validateStock(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });
    if (inventory && inventory.trackInventory && !inventory.allowBackorder) {
      const available = inventory.quantity - inventory.reserved;
      if (quantity > available) {
        throw new BadRequestException(
          `Insufficient stock: ${available} available, ${quantity} requested`,
        );
      }
    }
  }

  private async buildCartResponse(cart: CartEntity) {
    const items = await this.cartItemRepo.find({
      where: { cartId: cart.id },
      relations: [
        'variant',
        'variant.product',
        'variant.product.images',
      ],
      order: { createdAt: 'ASC' },
    });

    const coupons = await this.cartCouponRepo.find({
      where: { cartId: cart.id },
    });

    const mappedItems = items.map((item) => {
      const product = item.variant?.product;
      const images = product?.images ?? [];
      const lineTotal = item.unitPrice * item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: product?.id ?? null,
        productName: product?.name ?? {},
        productSlug: product?.slug ?? '',
        variantName: item.variant?.name ?? {},
        sku: item.variant?.sku ?? '',
        image: images[0]?.url ?? '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      };
    });

    const subtotal = mappedItems.reduce((s, i) => s + i.lineTotal, 0);
    const discountTotal = coupons.reduce((s, c) => s + c.discountAmount, 0);
    const shippingTotal = 0;
    const taxTotal = 0;
    const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

    return {
      id: cart.id,
      items: mappedItems,
      coupons: coupons.map((c) => ({
        couponCode: c.couponCode,
        discountAmount: c.discountAmount,
      })),
      totals: {
        subtotal,
        discountTotal,
        shippingTotal,
        taxTotal,
        grandTotal,
      },
    };
  }
}
