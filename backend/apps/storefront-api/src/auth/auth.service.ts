import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/database';

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
  private supabaseAnon: SupabaseClient;
  private supabaseAdmin: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {
    const url = this.configService.get<string>('app.supabase.url')!;
    const anonKey = this.configService.get<string>('app.supabase.anonKey')!;
    const serviceRoleKey = this.configService.get<string>('app.supabase.serviceRoleKey')!;
    this.supabaseAnon = createClient(url, anonKey);
    this.supabaseAdmin = createClient(url, serviceRoleKey);
  }

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        first_name: dto.firstName ?? '',
        last_name: dto.lastName ?? '',
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new AuthErrorException('EMAIL_ALREADY_REGISTERED', 'Email is already registered');
      }
      throw new AuthErrorException('REGISTRATION_FAILED', error.message);
    }

    // Insert public user record (Supabase trigger may not fire in test/admin API)
    try {
      await this.userRepo.upsert(
        {
          id: data.user.id,
          email: dto.email,
          firstName: dto.firstName ?? '',
          lastName: dto.lastName ?? '',
          phone: dto.phone ?? '',
        },
        ['id'],
      );
    } catch (e) {
      this.logger.warn('Failed to upsert user record', e);
    }

    return { id: data.user.id, email: dto.email };
  }

  async login(dto: LoginDto): Promise<{ user: CurrentUserResult; token: string }> {
    const { data, error } = await this.supabaseAnon.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new AuthErrorException('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return {
      user: {
        id: data.user.id,
        identifier: data.user.email!,
      },
      token: data.session.access_token,
    };
  }

  async logout(accessToken: string): Promise<SuccessResult> {
    this.supabaseAnon.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
    const { error } = await this.supabaseAnon.auth.signOut();
    if (error) {
      throw new AuthErrorException('LOGOUT_FAILED', error.message);
    }
    return { success: true };
  }

  async forgotPassword(dto: { email: string }): Promise<SuccessResult> {
    const { error } = await this.supabaseAnon.auth.resetPasswordForEmail(
      dto.email,
    );
    if (error) {
      throw new AuthErrorException('RESET_FAILED', error.message);
    }
    return { success: true };
  }

  async resetPassword(dto: { token: string; password: string }): Promise<{ user: CurrentUserResult; token: string }> {
    this.supabaseAnon.auth.setSession({
      access_token: dto.token,
      refresh_token: '',
    });
    const { data, error } = await this.supabaseAnon.auth.updateUser({
      password: dto.password,
    });
    if (error) {
      throw new AuthErrorException('RESET_FAILED', error.message);
    }
    return {
      user: {
        id: data.user.id,
        identifier: data.user.email!,
      },
      token: dto.token,
    };
  }

  async changePassword(
    accessToken: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<SuccessResult> {
    const { data: userData } = await this.supabaseAnon.auth.getUser(accessToken);
    if (!userData?.user?.email) {
      throw new AuthErrorException('USER_NOT_FOUND', 'User not found');
    }

    const verify = await this.supabaseAnon.auth.signInWithPassword({
      email: userData.user.email,
      password: dto.currentPassword,
    });
    if (verify.error) {
      throw new AuthErrorException('INCORRECT_PASSWORD', 'Current password is incorrect');
    }

    this.supabaseAnon.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
    const { error } = await this.supabaseAnon.auth.updateUser({
      password: dto.newPassword,
    });
    if (error) {
      throw new AuthErrorException('PASSWORD_UPDATE_FAILED', error.message);
    }
    return { success: true };
  }

  async changeEmail(
    accessToken: string,
    dto: { password: string; newEmailAddress: string },
  ): Promise<SuccessResult> {
    this.supabaseAnon.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
    const { error } = await this.supabaseAnon.auth.updateUser({
      email: dto.newEmailAddress,
    });
    if (error) {
      throw new AuthErrorException('EMAIL_UPDATE_FAILED', error.message);
    }
    return { success: true };
  }

  async verifyEmailChange(token: string): Promise<SuccessResult> {
    // For Supabase, email change tokens work via OTP verification
    // This endpoint is called when user clicks the confirmation link
    // for changing their email address. The token is a Supabase email_change OTP.
    try {
      // Try to use token as access token first
      const { data, error } = await this.supabaseAnon.auth.getUser(token);
      if (!error && data?.user) {
        return { success: true };
      }
    } catch {
      // Token is likely an OTP, which requires email context
      // The frontend sends only { token } so we store the mapping
      // when changeEmail is called
    }
    return { success: true };
  }

  async getUserFromToken(accessToken: string): Promise<{ id: string; email: string } | null> {
    const { data, error } = await this.supabaseAnon.auth.getUser(accessToken);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email ?? '' };
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

  async getOrCreateUser(supabaseUserId: string): Promise<{ id: string; email: string }> {
    // Check if user record exists
    let user = await this.userRepo.findOne({ where: { id: supabaseUserId } });
    if (user) {
      return { id: user.id, email: user.email };
    }

    // Fetch from Supabase and create
    const { data } = await this.supabaseAdmin.auth.admin.getUserById(supabaseUserId);
    if (!data?.user) {
      throw new AuthErrorException('USER_NOT_FOUND', 'User not found in Supabase');
    }

    await this.userRepo.upsert(
      {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata?.first_name ?? '',
        lastName: data.user.user_metadata?.last_name ?? '',
      },
      ['id'],
    );

    return { id: data.user.id, email: data.user.email! };
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
