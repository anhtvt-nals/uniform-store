import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EntityType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
}

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export class SignedUrlDto {
  @ApiProperty({ description: 'Original filename with extension' })
  @IsString()
  @Matches(/\.(jpg|jpeg|png|webp|gif|avif)$/i, {
    message: 'File must be an image (jpg, jpeg, png, webp, gif, avif)',
  })
  filename: string;

  @ApiProperty({ enum: ALLOWED_CONTENT_TYPES })
  @IsString()
  contentType: string;

  @ApiProperty({ enum: EntityType, required: false })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;
}
