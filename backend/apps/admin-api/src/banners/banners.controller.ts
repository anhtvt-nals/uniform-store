import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {AdminAuthGuard} from '@app/common';
import {BannersService} from './banners.service';

@UseGuards(AdminAuthGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() body: object) { return this.service.create(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: object) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
