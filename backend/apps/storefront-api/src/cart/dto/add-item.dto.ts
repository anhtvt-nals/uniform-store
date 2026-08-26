import { IsString, IsInt, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class AddItemDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  quantity: number;
}
