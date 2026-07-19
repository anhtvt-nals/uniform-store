import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandLogoDto } from './dto/brand-logo.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Brands')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'List brands with pagination, search, and sort' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new brand' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Get a brand by ID' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a brand' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Soft delete a brand (must have no products)' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Restore a soft-deleted brand' })
  restore(@Param('id') id: string) {
    return this.brandsService.restore(id);
  }

  @Patch(':id/logo')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update brand logo URL' })
  updateLogo(@Param('id') id: string, @Body() dto: BrandLogoDto) {
    return this.brandsService.updateLogo(id, dto);
  }
}
