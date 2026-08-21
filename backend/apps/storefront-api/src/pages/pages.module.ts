import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import {BannerEntity, SettingEntity} from '@app/database';

@Module({
    imports: [TypeOrmModule.forFeature([SettingEntity, BannerEntity])],
    controllers: [PagesController],
    providers: [PagesService],
    exports: [PagesService],
})
export class PagesModule {}
