import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from './signed-url.dto';

export class DeleteFileDto {
  @ApiProperty({ description: 'S3 object key to delete' })
  @IsString()
  key: string;

  @ApiProperty({ enum: EntityType, required: false })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;
}
