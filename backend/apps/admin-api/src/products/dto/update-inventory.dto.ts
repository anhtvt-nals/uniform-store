import { IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reserved?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockLevel?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;
}
