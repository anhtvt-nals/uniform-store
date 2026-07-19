import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseStockDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
