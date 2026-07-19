import { IsString, IsEnum, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from './signed-url.dto';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'S3 object key returned from signed-url' })
  @IsString()
  key: string;

  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  alt?: Record<string, string>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}
