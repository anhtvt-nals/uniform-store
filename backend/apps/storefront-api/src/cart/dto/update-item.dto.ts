import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  quantity?: number;
}
