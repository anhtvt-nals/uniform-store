import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerContractEntity } from '@app/database';
import { CustomerContractsService } from './customer-contracts.service';
import { CustomerContractsController } from './customer-contracts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerContractEntity])],
  controllers: [CustomerContractsController],
  providers: [CustomerContractsService],
})
export class CustomerContractsModule {}
