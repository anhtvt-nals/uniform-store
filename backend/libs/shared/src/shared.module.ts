import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage/storage.service';
import { MemoryCacheService } from './cache/memory-cache.service';
import appConfig from './config/app.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
  ],
  providers: [
    StorageService,
    { provide: 'CacheService', useClass: MemoryCacheService },
  ],
  exports: [StorageService, 'CacheService', ConfigModule],
})
export class SharedModule {}
