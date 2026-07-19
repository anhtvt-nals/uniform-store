import { CategoryTreeDto } from './category-tree.dto';

export class CategoryDetailDto extends CategoryTreeDto {
  description: Record<string, string>;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
