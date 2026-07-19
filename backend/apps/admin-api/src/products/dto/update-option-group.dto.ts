import { IsObject, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateOptionGroupDto {
  @IsOptional()
  @IsObject()
  name?: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
