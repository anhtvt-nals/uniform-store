import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
