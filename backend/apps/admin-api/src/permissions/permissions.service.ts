import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import {
  AdminUserEntity,
} from '@app/database';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepo: Repository<AdminUserEntity>,
  ) {}

  async findAll(query: AdminUserQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.adminUserRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateRole(id: string, dto: UpdateAdminRoleDto) {
    const validRoles = ['super_admin', 'admin', 'editor'];
    if (!validRoles.includes(dto.role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      );
    }

    const admin = await this.adminUserRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin user not found: ${id}`);
    }

    admin.role = dto.role;
    await this.adminUserRepo.save(admin);

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      updatedAt: admin.createdAt,
    };
  }
}
