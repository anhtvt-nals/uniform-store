import { IsArray, IsNumber } from 'class-validator';

export class PaginationResponseDto<T> {
  @IsArray()
  items: T[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalPages: number;

  constructor(partial: Partial<PaginationResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
