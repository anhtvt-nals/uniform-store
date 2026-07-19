import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
