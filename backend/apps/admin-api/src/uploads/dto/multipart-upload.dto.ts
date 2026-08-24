import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {EntityType} from './signed-url.dto';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export class StartMultipartUploadDto {
  @ApiProperty()
  @IsString()
  @Matches(/\.(jpg|jpeg|png|webp|gif|avif)$/i)
  filename: string;

  @ApiProperty({enum: ALLOWED_CONTENT_TYPES})
  @IsString()
  contentType: string;

  @ApiProperty({description: 'File size in bytes'})
  @IsInt()
  @IsPositive()
  size: number;

  @ApiPropertyOptional({enum: EntityType})
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;
}

class MultipartPartDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  partNumber: number;

  @ApiProperty()
  @IsString()
  etag: string;
}

export class CompleteMultipartUploadDto extends StartMultipartUploadDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  uploadId: string;

  @ApiProperty({type: [MultipartPartDto]})
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({each: true})
  @Type(() => MultipartPartDto)
  parts: MultipartPartDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class AbortMultipartUploadDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  uploadId: string;
}
