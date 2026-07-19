import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { AdminUserEntity } from '@app/database';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

function createMockRepo(methods: string[]) {
  const repo: Record<string, jest.Mock> = {};
  for (const method of methods) {
    repo[method] = jest.fn();
  }
  return repo;
}

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockAdminRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockAdminRepo = createMockRepo([
      'findAndCount', 'findOne', 'save',
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(AdminUserEntity), useValue: mockAdminRepo },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('findAll', () => {
    it('should return paginated admin users without passwordHash', async () => {
      mockAdminRepo.findAndCount.mockResolvedValue([
        [
          { id: 'a-1', email: 'admin@example.com', role: 'super_admin', createdAt: new Date() },
        ],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].email).toBe('admin@example.com');
      expect((result.items[0] as any).passwordHash).toBeUndefined();
    });
  });

  describe('updateRole', () => {
    const mockAdmin = {
      id: 'a-1',
      email: 'admin@example.com',
      role: 'editor',
      createdAt: new Date(),
    };

    it('should update admin user role', async () => {
      mockAdminRepo.findOne.mockResolvedValue({ ...mockAdmin });
      mockAdminRepo.save.mockResolvedValue({ ...mockAdmin, role: 'admin' });

      const result = await service.updateRole('a-1', { role: 'admin' });
      expect(result.role).toBe('admin');
      expect(mockAdminRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(
        service.updateRole('a-1', { role: 'invalid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if admin user not found', async () => {
      mockAdminRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateRole('nonexistent', { role: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
