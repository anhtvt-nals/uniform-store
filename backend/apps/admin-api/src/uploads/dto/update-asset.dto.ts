import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  @IsObject()
  alt?: Record<string, string>;

  @IsOptional()
  @IsObject()
  caption?: Record<string, string>;

  @IsOptional()
  @IsObject()
  title?: Record<string, string>;

  @IsOptional()
  @IsString()
  linkUrl?: string;
}
