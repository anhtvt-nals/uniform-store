import {
  IsString,
  IsObject,
  IsOptional,
  Matches,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UpdateProductDto {
  @IsOptional()
  @IsObject()
  name?: Record<string, string>;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Matches(UUID_REGEX)
  categoryId?: string;

  @IsOptional()
  @Matches(UUID_REGEX)
  brandId?: string | null;

  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @IsOptional()
  @IsObject()
  sortDescription?: Record<string, string>;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsObject()
  metaTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  detail?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metaDesc?: Record<string, string>;
}
