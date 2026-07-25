import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalUserAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return true;

    try {
      const secret = this.configService.get<string>('app.userJwt.secret') || process.env.USER_JWT_SECRET!;
      const payload = jwt.verify(token, secret) as { sub: string; email: string };

      request.user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      // Token invalid — continue without user
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const auth = request.headers?.authorization;
    if (!auth) return undefined;
    const [scheme, token] = auth.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
    return token;
  }
}
