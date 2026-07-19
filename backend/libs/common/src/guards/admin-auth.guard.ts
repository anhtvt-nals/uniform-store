import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing admin authentication token');
    }

    try {
      const secret = this.configService.get<string>('app.adminJwt.secret') || process.env.ADMIN_JWT_SECRET!;
      const payload = jwt.verify(token, secret) as AdminJwtPayload;

      request.admin = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Admin token has expired');
      }
      throw new UnauthorizedException('Invalid admin token');
    }
  }

  private extractToken(request: any): string | undefined {
    const auth = request.headers?.authorization;
    if (!auth) return undefined;
    const [scheme, token] = auth.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
    return token;
  }
}
