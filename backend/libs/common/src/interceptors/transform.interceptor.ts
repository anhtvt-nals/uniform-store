import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface WrappedResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, WrappedResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const result: WrappedResponse<T> = {
          success: true as const,
          data,
        };
        if (data && typeof data === 'object' && 'meta' in (data as any)) {
          const d = data as any;
          result.meta = d.meta;
          delete d.meta;
        }
        return result;
      }),
    );
  }
}
