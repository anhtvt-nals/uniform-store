import { IsString, IsObject, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsObject()
  title?: Record<string, string>;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsObject()
  excerpt?: Record<string, string>;

  @IsOptional()
  @IsObject()
  content?: Record<string, string>;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  /** Vietnamese tag labels entered by an administrator. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];
}
