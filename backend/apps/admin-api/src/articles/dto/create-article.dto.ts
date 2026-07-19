import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

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
  @IsBoolean()
  isPublished?: boolean;
}
