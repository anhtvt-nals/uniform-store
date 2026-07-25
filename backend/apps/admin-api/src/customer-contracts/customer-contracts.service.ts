import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CustomerContractEntity } from '@app/database';
import { CustomerContractQueryDto } from './dto/customer-contract-query.dto';
import { CreateCustomerContractDto } from './dto/create-customer-contract.dto';
import { UpdateCustomerContractDto } from './dto/update-customer-contract.dto';

@Injectable()
export class CustomerContractsService {
  constructor(
    @InjectRepository(CustomerContractEntity)
    private readonly repo: Repository<CustomerContractEntity>,
  ) {}

  async findAll(query: CustomerContractQueryDto) {
    const { search, isActive, page = 1, limit = 20 } = query;

    const qb = this.repo.createQueryBuilder('c');

    if (search) {
      qb.andWhere('c.name ILIKE :search', { search: `%${search}%` });
    }

    if (isActive !== undefined) {
      qb.andWhere('c.is_active = :isActive', { isActive });
    }

    qb.orderBy('c.display_order', 'ASC').addOrderBy('c.created_at', 'DESC');

    const total = await qb.clone().getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const contract = await this.repo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Customer contract not found');
    return contract;
  }

  async create(dto: CreateCustomerContractDto) {
    const contract = this.repo.create(dto);
    return this.repo.save(contract);
  }

  async update(id: string, dto: UpdateCustomerContractDto) {
    const contract = await this.findOne(id);
    Object.assign(contract, dto);
    return this.repo.save(contract);
  }

  async remove(id: string) {
    const contract = await this.findOne(id);
    return this.repo.remove(contract);
  }
}
