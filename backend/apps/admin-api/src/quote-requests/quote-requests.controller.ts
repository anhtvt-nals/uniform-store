import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';
import { QuoteRequestsService } from './quote-requests.service';
import { QuoteRequestQueryDto } from './dto/quote-request-query.dto';
import { UpdateQuoteRequestStatusDto } from './dto/update-quote-request-status.dto';
import { UpdateQuoteRequestNotesDto } from './dto/update-quote-request-notes.dto';

@ApiTags('Admin Quote Requests')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'analyst')
  @ApiOperation({ summary: 'List all quote requests' })
  findAll(@Query() query: QuoteRequestQueryDto) {
    return this.quoteRequestsService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'analyst')
  @ApiOperation({ summary: 'Get quote request detail' })
  findOne(@Param('id') id: string) {
    return this.quoteRequestsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Update quote request status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteRequestStatusDto,
  ) {
    return this.quoteRequestsService.updateStatus(id, dto.status);
  }

  @Post(':id/notes')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Add sales note to quote request' })
  updateNotes(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteRequestNotesDto,
  ) {
    return this.quoteRequestsService.updateNotes(id, dto.salesNote);
  }
}
