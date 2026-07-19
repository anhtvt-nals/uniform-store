import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUUID, IsInt, Min } from 'class-validator';

class ReorderItem {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
