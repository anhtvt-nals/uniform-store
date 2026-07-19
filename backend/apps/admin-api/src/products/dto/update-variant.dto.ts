import {
  IsString,
  IsObject,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsObject()
  name?: Record<string, string>;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  comparePrice?: number | null;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
