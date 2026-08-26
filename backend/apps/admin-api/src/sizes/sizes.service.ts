import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {SizeEntity} from '@app/database';

@Injectable()
export class SizesService {
  constructor(@InjectRepository(SizeEntity) private readonly repo: Repository<SizeEntity>) {}
  findAll() { return this.repo.find({where: {}, order: {sortOrder: 'ASC', code: 'ASC'}}); }
  async create(body: Partial<SizeEntity>) { return this.repo.save(this.repo.create({...body, code: body.code?.trim().toUpperCase()})); }
  async update(id: string, body: Partial<SizeEntity>) { const size = await this.repo.findOne({where: {id}}); if (!size) throw new NotFoundException('Không tìm thấy size'); Object.assign(size, body.code ? {...body, code: body.code.trim().toUpperCase()} : body); return this.repo.save(size); }
  async remove(id: string) { const size = await this.repo.findOne({where: {id}}); if (!size) throw new NotFoundException('Không tìm thấy size'); await this.repo.softRemove(size); return {success: true}; }
}
