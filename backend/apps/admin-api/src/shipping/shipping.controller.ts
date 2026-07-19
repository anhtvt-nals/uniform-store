import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Shipping')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('shipping-methods')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Post()
  create(@Body() _body: Record<string, unknown>) {
    return this.shippingService.create(_body);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() _body: Record<string, unknown>) {
    return this.shippingService.update(_id, _body);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.shippingService.remove(_id);
  }
}
