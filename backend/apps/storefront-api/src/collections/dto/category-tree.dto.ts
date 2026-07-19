export class CategoryTreeDto {
  id: string;
  name: Record<string, string>;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  children?: CategoryTreeDto[];
}
