import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const STATUSES = ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'] as const;

export class UpdateQuoteRequestStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsString()
  @IsIn(STATUSES)
  status: string;
}
