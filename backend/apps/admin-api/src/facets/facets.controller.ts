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
import { FacetsService } from './facets.service';
import { AdminAuthGuard } from '@app/common';

@ApiTags('Admin Facets')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller()
export class FacetsController {
  constructor(private readonly facetsService: FacetsService) {}

  @Get('facet-groups')
  findAllGroups() {
    return this.facetsService.findAllGroups();
  }

  @Post('facet-groups')
  createGroup(@Body() _body: Record<string, unknown>) {
    return this.facetsService.createGroup(_body);
  }

  @Patch('facet-groups/:id')
  updateGroup(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.facetsService.updateGroup(_id, _body);
  }

  @Delete('facet-groups/:id')
  removeGroup(@Param('id') _id: string) {
    return this.facetsService.removeGroup(_id);
  }

  @Get('facet-values')
  findAllValues() {
    return this.facetsService.findAllValues();
  }

  @Post('facet-values')
  createValue(@Body() _body: Record<string, unknown>) {
    return this.facetsService.createValue(_body);
  }

  @Patch('facet-values/:id')
  updateValue(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.facetsService.updateValue(_id, _body);
  }

  @Delete('facet-values/:id')
  removeValue(@Param('id') _id: string) {
    return this.facetsService.removeValue(_id);
  }

  @Get('facet-groups/:id/values')
  findGroupValues(@Param('id') _id: string) {
    return this.facetsService.findGroupValues(_id);
  }

  @Post('facet-groups/:id/values')
  addGroupValue(
    @Param('id') _id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.facetsService.addGroupValue(_id, _body);
  }
}
