import { Module } from '@nestjs/common';
import { FacetsController } from './facets.controller';
import { FacetsService } from './facets.service';

@Module({
  controllers: [FacetsController],
  providers: [FacetsService],
  exports: [FacetsService],
})
export class FacetsModule {}
