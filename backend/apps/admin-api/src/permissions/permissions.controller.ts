import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Permissions')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('admin-users')
  @Roles('super_admin')
  @ApiOperation({ summary: 'List admin users' })
  findAll(@Query() query: AdminUserQueryDto) {
    return this.permissionsService.findAll(query);
  }

  @Patch('admin-users/:id/role')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update admin user role' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    return this.permissionsService.updateRole(id, dto);
  }
}
