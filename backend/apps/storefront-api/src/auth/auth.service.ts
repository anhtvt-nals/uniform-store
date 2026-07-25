import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRoleEntity, RoleEntity } from '@app/database';

export interface CurrentUserResult {
  id: string;
  identifier: string;
}

export interface SuccessResult {
  success: boolean;
}

export interface ErrorResult {
  errorCode: string;
  message: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new AuthErrorException('EMAIL_ALREADY_REGISTERED', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const id = crypto.randomUUID();

    await this.userRepo.insert({
      id,
      email: dto.email,
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      phone: dto.phone ?? '',
      passwordHash,
      isActive: true,
    });

    const customerRole = await this.roleRepo.findOne({ where: { name: 'customer' } });
    if (customerRole) {
      await this.userRoleRepo.insert({ userId: id, roleId: customerRole.id });
    }

    return { id, email: dto.email };
  }

  async login(dto: LoginDto): Promise<{ user: CurrentUserResult; token: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user || !user.passwordHash) {
      throw new AuthErrorException('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new AuthErrorException('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const secret = this.configService.get<string>('app.userJwt.secret')!;
    const expiresIn = this.configService.get<string>('app.userJwt.expiresIn') || '30d';

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      secret,
      { expiresIn } as jwt.SignOptions,
    );

    return {
      user: { id: user.id, identifier: user.email },
      token,
    };
  }

  async logout(): Promise<SuccessResult> {
    return { success: true };
  }

  async forgotPassword(dto: { email: string }): Promise<SuccessResult> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) return { success: true };

    const secret = this.configService.get<string>('app.userJwt.secret')!;
    const token = jwt.sign(
      { sub: user.id, email: user.email, purpose: 'password-reset' },
      secret,
      { expiresIn: '1h' } as jwt.SignOptions,
    );

    this.logger.log(`Password reset token for ${dto.email}: ${token}`);
    this.logger.warn('Email sending not implemented — log the reset token for now');

    return { success: true };
  }

  async resetPassword(dto: { token: string; password: string }): Promise<{ user: CurrentUserResult; token: string }> {
    const secret = this.configService.get<string>('app.userJwt.secret')!;
    let payload: { sub: string; email: string; purpose?: string };
    try {
      payload = jwt.verify(dto.token, secret) as any;
    } catch {
      throw new AuthErrorException('INVALID_TOKEN', 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.userRepo.update(payload.sub, { passwordHash });

    const newToken = jwt.sign(
      { sub: payload.sub, email: payload.email },
      secret,
      { expiresIn: '30d' } as jwt.SignOptions,
    );

    return {
      user: { id: payload.sub, identifier: payload.email },
      token: newToken,
    };
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<SuccessResult> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new AuthErrorException('USER_NOT_FOUND', 'User not found');
    }

    const passwordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new AuthErrorException('INCORRECT_PASSWORD', 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(userId, { passwordHash });

    return { success: true };
  }

  async changeEmail(
    userId: string,
    dto: { password: string; newEmailAddress: string },
  ): Promise<SuccessResult> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new AuthErrorException('USER_NOT_FOUND', 'User not found');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new AuthErrorException('INCORRECT_PASSWORD', 'Current password is incorrect');
    }

    await this.userRepo.update(userId, { email: dto.newEmailAddress });
    return { success: true };
  }

  async verifyEmailChange(token: string): Promise<SuccessResult> {
    return { success: true };
  }

  async getUserFromToken(accessToken: string): Promise<{ id: string; email: string } | null> {
    const secret = this.configService.get<string>('app.userJwt.secret')!;
    try {
      const payload = jwt.verify(accessToken, secret) as { sub: string; email: string };
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }

  async getMe(userId: string): Promise<CurrentUserResult | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      identifier: user.email,
    };
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; firstName: string; lastName: string; phone: string } | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    };
  }

  async updateProfile(
    userId: string,
    dto: { firstName: string; lastName: string; phone?: string },
  ): Promise<{ id: string; email: string; firstName: string; lastName: string; phone: string }> {
    const update: any = {
      firstName: dto.firstName,
      lastName: dto.lastName,
    };
    if (dto.phone !== undefined) {
      update.phone = dto.phone;
    }
    await this.userRepo.update(userId, update);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return {
      id: user!.id,
      email: user!.email,
      firstName: user!.firstName ?? '',
      lastName: user!.lastName ?? '',
      phone: user!.phone ?? '',
    };
  }

  async getOrCreateUser(userId: string): Promise<{ id: string; email: string }> {
    let user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      return { id: user.id, email: user.email };
    }
    throw new AuthErrorException('USER_NOT_FOUND', 'User not found');
  }
}

export class AuthErrorException extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthErrorException';
  }
}
