import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsIn(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @Type(() => Number)
  @Min(1)
  value: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productIds: string[];

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minQuantityPerProduct?: number = 1;
}
