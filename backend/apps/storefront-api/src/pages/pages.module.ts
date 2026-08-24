import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import {BannerEntity, SettingEntity, TestimonialEntity} from '@app/database';

@Module({
    imports: [TypeOrmModule.forFeature([SettingEntity, BannerEntity, TestimonialEntity])],
    controllers: [PagesController],
    providers: [PagesService],
    exports: [PagesService],
})
export class PagesModule {}
