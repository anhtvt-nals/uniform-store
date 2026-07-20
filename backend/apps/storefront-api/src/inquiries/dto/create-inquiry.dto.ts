import { IsString, IsOptional, IsInt, Min, IsUUID } from 'class-validator';

export class CreateInquiryDto {
  @IsUUID()
  productId: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
