import { IsString, IsOptional } from 'class-validator';

export class AddressDto {
  @IsString()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  postalCode: string;

  @IsString()
  countryCode: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
