import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { StorageService } from './storage/storage.service';
import { MemoryCacheService } from './cache/memory-cache.service';
import { MailService } from './mail/mail.service';
import { StorageUrlInterceptor } from './interceptors/storage-url.interceptor';
import appConfig from './config/app.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), '../.env'),
      load: [appConfig],
      isGlobal: true,
    }),
  ],
  providers: [
    StorageService,
    MailService,
    StorageUrlInterceptor,
    { provide: 'CacheService', useClass: MemoryCacheService },
  ],
  exports: [StorageService, MailService, StorageUrlInterceptor, 'CacheService', ConfigModule],
})
export class SharedModule {}
