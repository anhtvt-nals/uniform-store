import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Assets')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('uploads')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  upload(@Body() _body: Record<string, unknown>) {
    return this.assetsService.upload(_body);
  }

  @Delete()
  remove(@Body() _body: Record<string, unknown>) {
    return this.assetsService.remove(_body);
  }
}
