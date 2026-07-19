import { IsObject, IsInt, Min, IsOptional } from 'class-validator';

export class CreateOptionGroupDto {
  @IsObject()
  name: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
