import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.interface';

@Injectable()
export class RedisCacheService implements CacheService {
  async get<T>(_key: string): Promise<T | null> {
    throw new Error('not implemented');
  }

  async set<T>(_key: string, _value: T, _ttlMs?: number): Promise<void> {
    throw new Error('not implemented');
  }

  async del(_key: string): Promise<void> {
    throw new Error('not implemented');
  }

  async reset(): Promise<void> {
    throw new Error('not implemented');
  }
}
