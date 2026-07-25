import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '@app/common';
import { CustomerContractsService } from './customer-contracts.service';
import { CustomerContractQueryDto } from './dto/customer-contract-query.dto';
import { CreateCustomerContractDto } from './dto/create-customer-contract.dto';
import { UpdateCustomerContractDto } from './dto/update-customer-contract.dto';

@ApiTags('Admin - Customer Contracts')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('customer-contracts')
export class CustomerContractsController {
  constructor(private readonly service: CustomerContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List all customer contracts' })
  findAll(@Query() query: CustomerContractQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer contract detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer contract' })
  create(@Body() dto: CreateCustomerContractDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer contract' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerContractDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer contract' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
