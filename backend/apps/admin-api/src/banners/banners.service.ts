import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BannerEntity} from '@app/database';

@Injectable()
export class BannersService {
  constructor(@InjectRepository(BannerEntity) private readonly repo: Repository<BannerEntity>) {}
  findAll() { return this.repo.find({where: {position: 'hero'}, order: {sortOrder: 'ASC', createdAt: 'ASC'}}); }
  create(input: Partial<BannerEntity>) { return this.repo.save(this.repo.create({...input, position: 'hero'})); }
  async update(id: string, input: Partial<BannerEntity>) { const item = await this.repo.findOne({where: {id}}); if (!item) throw new NotFoundException('Hero slide not found'); return this.repo.save(Object.assign(item, input, {position: 'hero'})); }
  async remove(id: string) { const item = await this.repo.findOne({where: {id}}); if (!item) throw new NotFoundException('Hero slide not found'); await this.repo.remove(item); }
}
