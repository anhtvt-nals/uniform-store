import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCartOrderDto {
  @IsString()
  @MaxLength(200)
  customerName: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  productType?: string;
}
