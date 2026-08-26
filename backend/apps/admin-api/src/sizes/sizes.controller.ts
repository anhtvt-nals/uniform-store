import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AdminAuthGuard, Roles, RolesGuard} from '@app/common';
import {SizesService} from './sizes.service';

@ApiTags('Admin Sizes') @ApiBearerAuth() @UseGuards(AdminAuthGuard, RolesGuard) @Controller('sizes')
export class SizesController {
  constructor(private readonly service: SizesService) {}
  @Get() @Roles('super_admin', 'admin', 'editor') findAll() { return this.service.findAll(); }
  @Post() @Roles('super_admin', 'admin') create(@Body() body: {code: string; weightRange?: string; sortOrder?: number; isActive?: boolean}) { return this.service.create(body); }
  @Patch(':id') @Roles('super_admin', 'admin') update(@Param('id') id: string, @Body() body: {code?: string; weightRange?: string; sortOrder?: number; isActive?: boolean}) { return this.service.update(id, body); }
  @Delete(':id') @Roles('super_admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
