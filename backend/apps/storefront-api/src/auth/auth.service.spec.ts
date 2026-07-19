import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

const mockSupabase = {
  auth: {
    admin: {
      createUser: jest.fn(),
      getUserById: jest.fn(),
    },
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    verifyOtp: jest.fn(),
    setSession: jest.fn(),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                'supabase.url': 'http://localhost:54321',
                'supabase.anonKey': 'anon-key',
                'supabase.serviceRoleKey': 'service-role-key',
              };
              return map[key] || null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user and return id and email', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ id: 'user-1', email: 'test@test.com' });
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'already registered' },
      });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on other errors', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'some error' },
      });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return session and user on success', async () => {
      const session = { access_token: 'token', refresh_token: 'refresh' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session,
          user: { id: 'user-1', email: 'test@test.com' },
        },
        error: null,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.session).toEqual(session);
      expect(result.user.email).toEqual('test@test.com');
    });

    it('should throw BadRequestException on invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@test.com',
            phone: null,
            created_at: '2024-01-01',
            user_metadata: { first_name: 'John' },
          },
        },
        error: null,
      });

      const result = await service.getMe('user-1');
      expect(result.email).toEqual('test@test.com');
      expect(result.userMetadata).toEqual({ first_name: 'John' });
    });

    it('should throw if user not found', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      });

      await expect(service.getMe('nonexistent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await service.forgotPassword({
        email: 'test@test.com',
      });
      expect(result.message).toContain('reset');
    });
  });
});
