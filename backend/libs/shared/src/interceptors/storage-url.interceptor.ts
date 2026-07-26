import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor to replace storage URL patterns in response
 * Converts relative keys or old URLs to current STORAGE_PUBLIC_URL
 * 
 * This allows changing storage domains without database migration
 */
@Injectable()
export class StorageUrlInterceptor implements NestInterceptor {
  private readonly storagePublicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const storage = this.configService.get('app.storage');
    this.storagePublicUrl = storage?.publicUrl || '';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!this.storagePublicUrl) {
          return data;
        }
        return this.transformUrls(data);
      }),
    );
  }

  /**
   * Public so controllers that take over the response with @Res() — and are
   * therefore skipped by the interceptor pipeline — can apply the same
   * transformation by hand. See ShopApiController.
   */
  transformUrls(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformUrls(item));
    }

    // Values that are objects but must never be walked. Object.entries() on a
    // Date returns [], so rebuilding it field by field silently produces {} —
    // every createdAt/updatedAt in the response would reach the client as an
    // empty object and blow up any date formatting downstream.
    if (
      data instanceof Date ||
      Buffer.isBuffer(data) ||
      data instanceof RegExp
    ) {
      return data;
    }

    // Handle objects
    if (typeof data === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Transform URL fields
        if (this.isUrlField(key) && typeof value === 'string') {
          result[key] = this.buildPublicUrl(value);
        } else {
          result[key] = this.transformUrls(value);
        }
      }
      return result;
    }

    return data;
  }

  private isUrlField(key: string): boolean {
    const urlFields = [
      'url',
      'imageUrl',
      'image_url',
      'logoUrl',
      'logo_url',
      'contractImageUrl',
      'contract_image_url',
      'previewUrl',
      'preview_url',
      'preview',
      'source',
      'thumbnailUrl',
      'thumbnail_url',
    ];
    return urlFields.includes(key);
  }

  private buildPublicUrl(value: string): string {
    if (!value) return value;

    // Already a full URL (http/https) → return as is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Relative key → build full URL
    const base = this.storagePublicUrl.replace(/\/+$/, '');
    const path = value.replace(/^\/+/, '');
    return `${base}/${path}`;
  }
}
