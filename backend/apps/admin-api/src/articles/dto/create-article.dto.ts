import { IsString, IsObject, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsObject()
  title: Record<string, string>;

  @IsString()
  slug: string;

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
  @IsObject()
  metaTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metaDesc?: Record<string, string>;

  @IsOptional()
  @IsObject()
  focusKeyword?: Record<string, string>;

  @IsOptional()
  @IsObject()
  ogTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  ogDescription?: Record<string, string>;

  @IsOptional()
  @IsObject()
  ogImageUrl?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  /** Vietnamese tag labels entered by an administrator. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];
}
