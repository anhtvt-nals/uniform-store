import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Activity Logs')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'List activity logs (paginated, filterable)' })
  findAll(@Query() query: ActivityLogQueryDto) {
    return this.activityLogsService.findAll(query);
  }

  @Get('actions')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get distinct action types' })
  getActions() {
    return this.activityLogsService.getDistinctActions();
  }

  @Get('entity-types')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get distinct entity types' })
  getEntityTypes() {
    return this.activityLogsService.getDistinctEntityTypes();
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get activity log detail' })
  findOne(@Param('id') id: string) {
    return this.activityLogsService.findOne(id);
  }
}
