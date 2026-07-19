import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}
