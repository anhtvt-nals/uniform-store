import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '@app/database';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SettingEntity)
        private readonly settingsRepo: Repository<SettingEntity>,
    ) {}

    async findAll(): Promise<SettingEntity[]> {
        return this.settingsRepo.find({ order: { groupName: 'ASC', key: 'ASC' } });
    }

    async findByKey(key: string): Promise<SettingEntity> {
        const setting = await this.settingsRepo.findOne({ where: { key } });
        if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
        return setting;
    }

    async update(key: string, value: any): Promise<SettingEntity> {
        const setting = await this.findByKey(key);
        setting.value = value;
        return this.settingsRepo.save(setting);
    }
}
