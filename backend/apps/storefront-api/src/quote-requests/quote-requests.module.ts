import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteRequestsController } from './quote-requests.controller';
import { QuoteRequestsService } from './quote-requests.service';
import { QuoteRequestEntity, UserEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([QuoteRequestEntity, UserEntity])],
  controllers: [QuoteRequestsController],
  providers: [QuoteRequestsService],
})
export class QuoteRequestsModule {}
