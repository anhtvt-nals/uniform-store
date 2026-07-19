import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUserEntity } from '@app/database';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepo.findOne({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const secret = this.configService.get<string>('app.adminJwt.secret') || process.env.ADMIN_JWT_SECRET!;
    const expiresIn =
      this.configService.get<string>('app.adminJwt.expiresIn') || process.env.ADMIN_JWT_EXPIRES_IN || '8h';

    const accessToken = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      secret,
      { expiresIn: expiresIn } as jwt.SignOptions,
    );

    return {
      accessToken,
      expiresIn,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async refresh(token: string) {
    const secret = this.configService.get<string>('app.adminJwt.secret') || process.env.ADMIN_JWT_SECRET!;
    let payload: any;
    try {
      payload = jwt.verify(token, secret, { ignoreExpiration: true });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const expiresIn =
      this.configService.get<string>('app.adminJwt.expiresIn') || process.env.ADMIN_JWT_EXPIRES_IN || '8h';

    const accessToken = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: expiresIn } as jwt.SignOptions,
    );

    return { accessToken, expiresIn, admin: { id: admin.id, email: admin.email, role: admin.role } };
  }

  logout() {
    return { message: 'Logged out successfully' };
  }

  getProfile(admin: { id: string; email: string; role: string }) {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  }
}
