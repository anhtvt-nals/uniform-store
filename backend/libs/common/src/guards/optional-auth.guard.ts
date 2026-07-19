import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('app.supabase.url')!,
      this.configService.get<string>('app.supabase.serviceRoleKey')!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (!error && user) {
      request.user = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        appMetadata: user.app_metadata,
        userMetadata: user.user_metadata,
      };
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
