import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryEntity } from '@app/database';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InquiryEntity])],
  controllers: [InquiriesController],
  providers: [InquiriesService],
})
export class InquiriesModule {}
