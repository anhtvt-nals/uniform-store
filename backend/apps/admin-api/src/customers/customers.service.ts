import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import {
  UserEntity,
  AddressEntity,
  OrderEntity,
  UserRoleEntity,
} from '@app/database';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async findAll(query: CustomerQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<UserEntity> = {};

    if (query.q) {
      where.email = Like(`%${query.q}%`);
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [items, total] = await this.userRepo.findAndCount({
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

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Customer not found: ${id}`);
    }

    const orderCount = await this.orderRepo.count({
      where: { userId: id },
    });

    const totalSpent = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.grand_total), 0)', 'total')
      .where('o.user_id = :userId', { userId: id })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: ['cancelled'] })
      .getRawOne();

    return {
      ...user,
      orderCount,
      totalSpent: parseInt(totalSpent?.total ?? '0', 10),
    };
  }

  async findOrders(id: string, page = 1, limit = 20) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Customer not found: ${id}`);
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where: { userId: id },
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

  async findAddresses(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Customer not found: ${id}`);
    }

    return this.addressRepo.find({
      where: { userId: id },
      order: { createdAt: 'DESC' },
    });
  }
}
