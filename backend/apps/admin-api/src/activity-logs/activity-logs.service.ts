import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import {
  ActivityLogEntity,
} from '@app/database';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly logRepo: Repository<ActivityLogEntity>,
  ) {}

  async findAll(query: ActivityLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: FindOptionsWhere<ActivityLogEntity> = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.from || query.to) {
      where.createdAt = Between(
        query.from ? new Date(query.from) : new Date(0),
        query.to ? new Date(query.to) : new Date(),
      );
    }

    const [items, total] = await this.logRepo.findAndCount({
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
    const log = await this.logRepo.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Activity log not found: ${id}`);
    }
    return log;
  }

  async getDistinctActions() {
    const result = await this.logRepo
      .createQueryBuilder('l')
      .select('DISTINCT l.action', 'action')
      .orderBy('l.action')
      .getRawMany();
    return result.map((r) => r.action);
  }

  async getDistinctEntityTypes() {
    const result = await this.logRepo
      .createQueryBuilder('l')
      .select('DISTINCT l.entity_type', 'entityType')
      .orderBy('l.entity_type')
      .getRawMany();
    return result.map((r) => r.entityType);
  }
}
