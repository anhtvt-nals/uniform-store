import {
  IsString,
  IsObject,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateVariantDto {
  @IsObject()
  name: Record<string, string>;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  comparePrice?: number;

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

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds?: string[];
}
