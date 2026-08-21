import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PagesService } from './pages.service';

@ApiTags('Pages')
@Controller('api/v1')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('banners')
  getBanners(@Query('locale') locale?: string) {
    return this.pagesService.getBanners(locale);
  }

  @Get('settings/public')
  getPublicSettings() {
    return this.pagesService.getPublicSettings();
  }

  @Get('countries')
  getCountries() {
    return this.pagesService.getCountries();
  }

  @Get('channel')
  getChannel() {
    return this.pagesService.getChannel();
  }
}
