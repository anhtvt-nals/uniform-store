import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuoteRequestNotesDto {
  @ApiProperty({ description: 'Internal sales note' })
  @IsString()
  @MaxLength(2000)
  salesNote: string;
}
