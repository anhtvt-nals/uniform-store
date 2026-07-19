import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.interface';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class MemoryCacheService implements CacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }
}
