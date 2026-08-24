import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AdminAuthGuard} from '@app/common';
import {CreateTestimonialDto} from './dto/create-testimonial.dto';
import {UpdateTestimonialDto} from './dto/update-testimonial.dto';
import {TestimonialsService} from './testimonials.service';

@ApiTags('Admin - Testimonials')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() dto: CreateTestimonialDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
