import { IsString, IsOptional, IsIn } from 'class-validator';

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(VALID_STATUSES)
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}
