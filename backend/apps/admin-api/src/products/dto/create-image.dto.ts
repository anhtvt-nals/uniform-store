import { IsString, IsObject, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class CreateImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsObject()
  alt?: Record<string, string>;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
