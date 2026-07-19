import { IsString, IsUrl } from 'class-validator';

export class BrandLogoDto {
  @IsString()
  logoUrl: string;
}
