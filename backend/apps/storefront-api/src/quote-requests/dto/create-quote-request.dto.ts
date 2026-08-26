import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteRequestDto {
  @ApiProperty({ description: 'Customer or company name' })
  @IsString()
  @MaxLength(200)
  customerName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiProperty({ description: 'Region (Miền Bắc / Trung / Nam)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: 'Product type or department', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  productType?: string;

  @ApiProperty({ description: 'Quantity', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'Requested size', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sizeName?: string;

  @ApiProperty({ description: 'Source page', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}
