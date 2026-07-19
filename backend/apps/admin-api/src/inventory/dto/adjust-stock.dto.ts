import {
  IsInt,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StockAdjustmentType {
  ADJUSTMENT = 'adjustment',
  CORRECTION = 'correction',
  RETURN = 'return',
  DAMAGE = 'damage',
  TRANSFER = 'transfer',
  SALE = 'sale',
  OTHER = 'other',
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Quantity change (positive = increase, negative = decrease)' })
  @IsInt()
  quantityChange: number;

  @ApiProperty({ enum: StockAdjustmentType })
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  reasonCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}
