import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReserveStockDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
