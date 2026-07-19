import {
  IsString,
  IsEmail,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  streetLine1: string;

  @IsString()
  @IsOptional()
  streetLine2?: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class PlaceOrderDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  shippingAddress: OrderAddressDto;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  @IsOptional()
  billingAddress?: OrderAddressDto;

  @IsString()
  shippingMethod: string;

  @IsString()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
