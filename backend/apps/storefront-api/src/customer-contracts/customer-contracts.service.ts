import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerContractEntity } from '@app/database';

@Injectable()
export class CustomerContractsService {
  constructor(
    @InjectRepository(CustomerContractEntity)
    private readonly repo: Repository<CustomerContractEntity>,
  ) {}

  async findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }
}
