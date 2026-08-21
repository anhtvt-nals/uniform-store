import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {BannerEntity, SettingEntity} from '@app/database';

@Injectable()
export class PagesService {
    constructor(
        @InjectRepository(SettingEntity)
        private readonly settingsRepo: Repository<SettingEntity>,
        @InjectRepository(BannerEntity)
        private readonly bannersRepo: Repository<BannerEntity>,
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

    async getBanners(locale = 'vi') {
        const banners = await this.bannersRepo.find({
            where: {position: 'hero', isActive: true},
            order: {sortOrder: 'ASC', createdAt: 'ASC'},
        });
        return banners.map((banner) => ({
            id: banner.id,
            title: banner.title[locale] || banner.title.vi || '',
            content: banner.subtitle[locale] || banner.subtitle.vi || '',
            image: banner.imageUrl,
        }));
    }

    getCountries() {
        return { message: 'not implemented' };
    }

    getChannel() {
        return { message: 'not implemented' };
    }
}
