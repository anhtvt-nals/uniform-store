import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '@app/database';

@Injectable()
export class PagesService {
    constructor(
        @InjectRepository(SettingEntity)
        private readonly settingsRepo: Repository<SettingEntity>,
    ) {}

    async getPublicSettings() {
        const settings = await this.settingsRepo.find({
            where: { isPublic: true },
        });
        const result: Record<string, any> = {};
        for (const s of settings) {
            result[s.key] = s.value;
        }
        return result;
    }

    getBanners() {
        return { message: 'not implemented' };
    }

    getCountries() {
        return { message: 'not implemented' };
    }

    getChannel() {
        return { message: 'not implemented' };
    }
}
