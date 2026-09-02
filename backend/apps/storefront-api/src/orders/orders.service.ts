import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  CartEntity,
  CartItemEntity,
  CartCouponEntity,
  OrderEntity,
  OrderItemEntity,
  OrderAddressEntity,
  OrderPaymentEntity,
  OrderDiscountEntity,
  OrderStatusHistoryEntity,
  InventoryEntity,
  ProductVariantEntity,
  UserEntity,
} from '@app/database';
import { MailService } from '@app/shared';
import { PlaceOrderDto } from './dto/place-order.dto';
import { CreateCartOrderDto } from './dto/create-cart-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(CartCouponEntity)
    private readonly cartCouponRepo: Repository<CartCouponEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderAddressEntity)
    private readonly orderAddressRepo: Repository<OrderAddressEntity>,
    @InjectRepository(OrderPaymentEntity)
    private readonly orderPaymentRepo: Repository<OrderPaymentEntity>,
    @InjectRepository(OrderDiscountEntity)
    private readonly orderDiscountRepo: Repository<OrderDiscountEntity>,
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly orderStatusHistoryRepo: Repository<OrderStatusHistoryEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: PlaceOrderDto, userId?: string, sessionId?: string) {
    const cart = await this.findActiveCart(userId, sessionId);
    if (!cart) {
      throw new BadRequestException('No active cart found');
    }

    const items = await this.cartItemRepo.find({
      where: { cartId: cart.id },
      relations: ['variant', 'variant.product'],
    });

    if (!items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const coupons = await this.cartCouponRepo.find({
      where: { cartId: cart.id },
    });

    const billingAddress = dto.billingAddress ?? dto.shippingAddress;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customerId =
        userId ??
        (await this.syncCustomer(
          dto.email,
          dto.shippingAddress.fullName,
          dto.shippingAddress.phone ?? '',
          queryRunner.manager.getRepository(UserEntity),
        ));
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const discountTotal = coupons.reduce((sum, c) => sum + c.discountAmount, 0);
      const shippingTotal = 0;
      const taxTotal = 0;
      const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

      const order = queryRunner.manager.create(OrderEntity, {
        code: this.createOrderCode(),
        userId: customerId,
        email: dto.email,
        status: 'pending',
        currencyCode: 'VND',
        subtotal,
        discountTotal,
        shippingTotal,
        taxTotal,
        grandTotal,
        shippingMethod: dto.shippingMethod,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes ?? '',
      });
      const savedOrder = await queryRunner.manager.save(order);

      for (const item of items) {
        const productName = item.variant?.product?.name ?? {};
        const variantName = item.variant?.name ?? {};
        const linePrice = item.unitPrice * item.quantity;

        const orderItem = queryRunner.manager.create(OrderItemEntity, {
          orderId: savedOrder.id,
          variantId: item.variantId,
          productName,
          variantName,
          sku: item.variant?.sku ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          linePrice,
          sizeId: item.sizeId,
          sizeName: item.sizeName,
        });
        await queryRunner.manager.save(orderItem);
      }

      const shippingAddr = queryRunner.manager.create(OrderAddressEntity, {
        orderId: savedOrder.id,
        type: 'shipping',
        fullName: dto.shippingAddress.fullName,
        company: dto.shippingAddress.company ?? '',
        streetLine1: dto.shippingAddress.streetLine1,
        streetLine2: dto.shippingAddress.streetLine2 ?? '',
        city: dto.shippingAddress.city,
        province: dto.shippingAddress.province ?? '',
        postalCode: dto.shippingAddress.postalCode ?? '',
        countryCode: dto.shippingAddress.countryCode ?? 'VN',
        phone: dto.shippingAddress.phone ?? '',
      });
      await queryRunner.manager.save(shippingAddr);

      const billingAddr = queryRunner.manager.create(OrderAddressEntity, {
        orderId: savedOrder.id,
        type: 'billing',
        fullName: billingAddress.fullName,
        company: billingAddress.company ?? '',
        streetLine1: billingAddress.streetLine1,
        streetLine2: billingAddress.streetLine2 ?? '',
        city: billingAddress.city,
        province: billingAddress.province ?? '',
        postalCode: billingAddress.postalCode ?? '',
        countryCode: billingAddress.countryCode ?? 'VN',
        phone: billingAddress.phone ?? '',
      });
      await queryRunner.manager.save(billingAddr);

      const payment = queryRunner.manager.create(OrderPaymentEntity, {
        orderId: savedOrder.id,
        method: dto.paymentMethod,
        amount: grandTotal,
        status: 'pending',
      });
      await queryRunner.manager.save(payment);

      for (const coupon of coupons) {
        const discount = queryRunner.manager.create(OrderDiscountEntity, {
          orderId: savedOrder.id,
          couponCode: coupon.couponCode,
          description: '',
          amount: coupon.discountAmount,
        });
        await queryRunner.manager.save(discount);
      }

      const history = queryRunner.manager.create(OrderStatusHistoryEntity, {
        orderId: savedOrder.id,
        fromStatus: undefined,
        toStatus: 'pending',
        note: 'Order placed',
      });
      await queryRunner.manager.save(history);

      // Keep the completed cart empty even if an older cached response or a
      // duplicated active-cart record is read after checkout.
      await queryRunner.manager.delete(CartItemEntity, { cartId: cart.id });
      await queryRunner.manager.delete(CartCouponEntity, { cartId: cart.id });
      await queryRunner.manager.update(
        CartEntity,
        cart.id,
        // The database constraint uses the lifecycle values active, converted
        // and abandoned. A successfully created order converts this cart.
        { status: 'converted' },
      );

      await queryRunner.commitTransaction();

      await this.mailService.sendOrderNotification({
        code: savedOrder.code,
        createdAt: savedOrder.createdAt,
        customerName: dto.shippingAddress.fullName,
        phone: dto.shippingAddress.phone,
        email: dto.email,
        company: dto.shippingAddress.company,
        region: [dto.shippingAddress.city, dto.shippingAddress.province].filter(Boolean).join(', '),
        address: [dto.shippingAddress.streetLine1, dto.shippingAddress.streetLine2]
          .filter(Boolean)
          .join(', '),
        notes: dto.notes,
        total: grandTotal,
        items: items.map((item) => ({
          productName: this.getLocalizedName(item.variant?.product?.name),
          variantName: this.getLocalizedName(item.variant?.name),
          sku: item.variant?.sku,
          sizeName: item.sizeName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          linePrice: Number(item.unitPrice) * item.quantity,
        })),
      });

      return this.findOrderById(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createFromCartRequest(dto: CreateCartOrderDto, userId?: string, sessionId?: string) {
    const address = dto.address?.trim() || 'Chưa cung cấp';
    const region = dto.region?.trim() || 'Chưa xác định';

    return this.create(
      {
        email: dto.email?.trim() || '',
        shippingAddress: {
          fullName: dto.customerName.trim(),
          streetLine1: address,
          city: region,
          countryCode: 'VN',
          phone: dto.phone.trim(),
        },
        billingAddress: {
          fullName: dto.customerName.trim(),
          streetLine1: address,
          city: region,
          countryCode: 'VN',
          phone: dto.phone.trim(),
        },
        shippingMethod: 'sales_follow_up',
        paymentMethod: 'quote',
        notes: dto.productType?.trim() || '',
      },
      userId,
      sessionId,
    );
  }

  async findMyOrders(userId: string, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async syncCustomer(
    email: string,
    fullName: string,
    phone: string,
    repo: Repository<UserEntity> = this.userRepo,
  ): Promise<string | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/[\s.()-]/g, '');
    if (!normalizedEmail && !normalizedPhone) return undefined;

    const existing = await repo
      .createQueryBuilder('user')
      .where(normalizedEmail ? 'LOWER(user.email) = :email' : '1 = 0', { email: normalizedEmail })
      .orWhere(normalizedPhone ? 'user.phone = :phone' : '1 = 0', { phone: normalizedPhone })
      .getOne();
    const [firstName = '', ...lastNameParts] = fullName.trim().split(/\s+/);
    if (existing) {
      existing.firstName = firstName || existing.firstName;
      existing.lastName = lastNameParts.join(' ') || existing.lastName;
      existing.phone = normalizedPhone || existing.phone;
      await repo.save(existing);
      return existing.id;
    }
    if (!normalizedEmail) return undefined;
    const customer = repo.create({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      firstName,
      lastName: lastNameParts.join(' '),
      phone: normalizedPhone,
      isActive: true,
    });
    return (await repo.save(customer)).id;
  }

  private createOrderCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    return `MA-${date}-${suffix}`;
  }

  private getLocalizedName(value?: Record<string, string>): string {
    return value?.vi ?? value?.en ?? Object.values(value ?? {})[0] ?? 'Sản phẩm';
  }

  async findOrderByCode(code: string, userId?: string) {
    const where: any = { code };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.orderRepo.findOne({
      where,
      relations: ['items', 'addresses', 'payments', 'discounts', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${code}`);
    }

    return order;
  }

  async findOrderByCodeAndEmail(code: string, email: string) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.addresses', 'addresses')
      .where('UPPER(order.code) = UPPER(:code)', { code: code.trim() })
      .andWhere('LOWER(order.email) = LOWER(:email)', { email: email.trim() })
      .getOne();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng phù hợp');
    }

    const shippingAddress = order.addresses?.find((address) => address.type === 'shipping');
    const variantIds = order.items?.map((item) => item.variantId) ?? [];
    const variants = variantIds.length
      ? await this.productVariantRepo.find({
          where: variantIds.map((id) => ({ id })),
          relations: ['product', 'product.images'],
        })
      : [];
    const thumbnailByVariantId = new Map(
      variants.map((variant) => {
        const images = variant.product?.images ?? [];
        const thumbnail =
          images.find((image) => image.variantId === variant.id)?.url ?? images[0]?.url ?? null;
        return [variant.id, thumbnail];
      }),
    );

    return {
      code: order.code,
      status: order.status,
      createdAt: order.createdAt,
      currencyCode: order.currencyCode,
      total: Number(order.grandTotal ?? 0),
      customerName: shippingAddress?.fullName ?? '',
      shippingAddress: shippingAddress
        ? {
            streetLine1: shippingAddress.streetLine1,
            streetLine2: shippingAddress.streetLine2,
            city: shippingAddress.city,
            province: shippingAddress.province,
            postalCode: shippingAddress.postalCode,
          }
        : null,
      items: (order.items ?? []).map((item) => ({
        id: item.id,
        productName: item.productName?.vi ?? item.productName?.en ?? '',
        variantName: item.variantName?.vi ?? item.variantName?.en ?? '',
        quantity: item.quantity,
        linePrice: Number(item.linePrice ?? 0),
        thumbnailUrl: thumbnailByVariantId.get(item.variantId) ?? null,
        sizeName: item.sizeName,
      })),
    };
  }

  private async findOrderById(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'addresses', 'payments', 'discounts', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return order;
  }

  private async findActiveCart(userId?: string, sessionId?: string) {
    if (userId) {
      return this.cartRepo.findOne({
        where: { userId, status: 'active' },
      });
    }

    if (sessionId) {
      return this.cartRepo.findOne({
        where: { sessionId, status: 'active' },
      });
    }

    return null;
  }
}
