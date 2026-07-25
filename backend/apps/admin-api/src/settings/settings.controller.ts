import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AdminAuthGuard, RolesGuard, Roles } from '@app/common';

@ApiTags('Admin Settings')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    @Roles('super_admin', 'admin', 'editor', 'analyst')
    @ApiOperation({ summary: 'List all settings' })
    findAll() {
        return this.settingsService.findAll();
    }

    @Get(':key')
    @Roles('super_admin', 'admin', 'editor', 'analyst')
    @ApiOperation({ summary: 'Get setting by key' })
    findByKey(@Param('key') key: string) {
        return this.settingsService.findByKey(key);
    }

    @Patch(':key')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Update setting value' })
    update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
        return this.settingsService.update(key, dto.value);
    }
}
