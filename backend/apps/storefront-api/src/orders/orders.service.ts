import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
} from '@app/database';
import { PlaceOrderDto } from './dto/place-order.dto';
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
  ) {}

  async create(
    dto: PlaceOrderDto,
    userId?: string,
    sessionId?: string,
  ) {
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
      const subtotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0,
      );
      const discountTotal = coupons.reduce(
        (sum, c) => sum + c.discountAmount,
        0,
      );
      const shippingTotal = 0;
      const taxTotal = 0;
      const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

      const order = queryRunner.manager.create(OrderEntity, {
        userId: userId,
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

      await queryRunner.manager.update(
        CartEntity,
        cart.id,
        { status: 'ordered' },
      );

      await queryRunner.commitTransaction();

      return this.findOrderById(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

  async findOrderByCode(code: string, userId?: string) {
    const where: any = { code };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.orderRepo.findOne({
      where,
      relations: [
        'items',
        'addresses',
        'payments',
        'discounts',
        'statusHistory',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${code}`);
    }

    return order;
  }

  private async findOrderById(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'items',
        'addresses',
        'payments',
        'discounts',
        'statusHistory',
      ],
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
