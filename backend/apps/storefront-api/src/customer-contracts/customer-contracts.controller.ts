import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomerContractsService } from './customer-contracts.service';

@ApiTags('Customer Contracts')
@Controller('api/v1/customer-contracts')
export class CustomerContractsController {
  constructor(private readonly service: CustomerContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active customer contracts' })
  findAllActive() {
    return this.service.findAllActive();
  }
}
