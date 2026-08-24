import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {TestimonialEntity} from '@app/database';
import {CreateTestimonialDto} from './dto/create-testimonial.dto';
import {UpdateTestimonialDto} from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(@InjectRepository(TestimonialEntity) private readonly repo: Repository<TestimonialEntity>) {}

  findAll() {
    return this.repo.find({order: {sortOrder: 'ASC', createdAt: 'ASC'}});
  }

  async findOne(id: string) {
    const testimonial = await this.repo.findOne({where: {id}});
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  create(dto: CreateTestimonialDto) {
    return this.repo.save(this.repo.create({...dto, content: {vi: dto.content}, author: {vi: dto.author}, role: {vi: dto.role ?? ''}}));
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id);
    const {content, author, role, ...rest} = dto;
    Object.assign(testimonial, rest, {
      ...(content !== undefined && {content: {vi: content}}),
      ...(author !== undefined && {author: {vi: author}}),
      ...(role !== undefined && {role: {vi: role}}),
    });
    return this.repo.save(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.repo.remove(testimonial);
  }
}
