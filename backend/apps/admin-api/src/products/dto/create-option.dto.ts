import { IsObject, IsInt, Min, IsOptional, IsUUID } from 'class-validator';

export class CreateOptionDto {
  @IsUUID()
  groupId: string;

  @IsObject()
  name: Record<string, string>;

  @IsOptional()
  @IsObject()
  value?: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
