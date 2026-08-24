import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {BannerEntity, SettingEntity, TestimonialEntity} from '@app/database';

@Injectable()
export class PagesService {
    constructor(
        @InjectRepository(SettingEntity)
        private readonly settingsRepo: Repository<SettingEntity>,
        @InjectRepository(BannerEntity)
        private readonly bannersRepo: Repository<BannerEntity>,
        @InjectRepository(TestimonialEntity)
        private readonly testimonialsRepo: Repository<TestimonialEntity>,
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

    async getTestimonials(locale = 'vi') {
        const testimonials = await this.testimonialsRepo.find({
            where: {isActive: true},
            order: {sortOrder: 'ASC', createdAt: 'ASC'},
        });
        return testimonials.map((testimonial) => ({
            id: testimonial.id,
            text: testimonial.content[locale] || testimonial.content.vi || '',
            author: testimonial.author[locale] || testimonial.author.vi || '',
            role: testimonial.role[locale] || testimonial.role.vi || '',
            avatarUrl: testimonial.avatarUrl,
            rating: testimonial.rating,
        }));
    }

    getCountries() {
        return { message: 'not implemented' };
    }

    getChannel() {
        return { message: 'not implemented' };
    }
}
