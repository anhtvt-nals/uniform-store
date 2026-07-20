import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '@app/common';
import { InquiriesService } from './inquiries.service';
import { InquiryQueryDto } from './dto/inquiry-query.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';

@ApiTags('Admin - Inquiries')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('api/v1/admin/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all inquiries' })
  findAll(@Query() query: InquiryQueryDto) {
    return this.inquiriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry detail' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update inquiry status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inquiry' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
