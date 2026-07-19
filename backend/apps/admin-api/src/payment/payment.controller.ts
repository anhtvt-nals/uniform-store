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
import { PaymentService } from './payment.service';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Payment')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('payment-methods')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Post()
  create(@Body() _body: Record<string, unknown>) {
    return this.paymentService.create(_body);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() _body: Record<string, unknown>) {
    return this.paymentService.update(_id, _body);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.paymentService.remove(_id);
  }
}
