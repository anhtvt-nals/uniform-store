import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateInquiryStatusDto {
  @IsString()
  @IsIn(['pending', 'contacted', 'completed', 'cancelled'])
  status: string;
}
