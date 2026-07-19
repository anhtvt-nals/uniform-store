import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import {
  OrderEntity,
  OrderStatusHistoryEntity,
} from '@app/database';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/order-query.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<OrderStatusHistoryEntity>,
  ) {}

  async findAll(query: AdminOrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<OrderEntity> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.code = Like(`%${query.q}%`);
    }

    if (query.from || query.to) {
      where.createdAt = Between(
        query.from ? new Date(query.from) : new Date(0),
        query.to ? new Date(query.to) : new Date(),
      );
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['items'],
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
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

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    performedBy?: string,
  ) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${order.status}' to '${dto.status}'. ` +
          `Allowed transitions: ${(allowed ?? []).join(', ') || 'none'}`,
      );
    }

    const previousStatus = order.status;
    order.status = dto.status;
    await this.orderRepo.save(order);

    const history = this.statusHistoryRepo.create({
      orderId: order.id,
      fromStatus: previousStatus,
      toStatus: dto.status,
      note: dto.note ?? '',
      performedBy,
    });
    await this.statusHistoryRepo.save(history);

    return {
      id: order.id,
      code: order.code,
      status: order.status,
      previousStatus,
    };
  }

  async getStatusHistory(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    const history = await this.statusHistoryRepo.find({
      where: { orderId: id },
      order: { createdAt: 'DESC' },
    });

    return history;
  }
}
