import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AdminUserEntity } from '@app/database';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockAdminRepo = {
  findOne: jest.fn(),
};

describe('AdminAuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: mockAdminRepo,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                'adminJwt.secret': 'test-secret',
                'adminJwt.expiresIn': '1h',
              };
              return map[key] || null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const admin = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'admin',
        passwordHash: '$2b$10$hashed',
      };

      mockAdminRepo.findOne.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'admin@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toEqual('jwt-token');
      expect(result.admin.email).toEqual('admin@test.com');
      expect(result.admin.role).toEqual('admin');
    });

    it('should throw UnauthorizedException when admin not found', async () => {
      mockAdminRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const admin = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'admin',
        passwordHash: '$2b$10$hashed',
      };

      mockAdminRepo.findOne.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'admin@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return admin profile from JWT payload', () => {
      const result = service.getProfile({
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'super_admin',
      });

      expect(result.id).toEqual('admin-1');
      expect(result.role).toEqual('super_admin');
    });
  });
});
