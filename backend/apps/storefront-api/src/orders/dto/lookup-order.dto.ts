import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

export class LookupOrderDto {
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MaxLength(64)
  @Matches(/^MA-[A-Z0-9-]+$/i, {
    message: 'Mã đơn hàng không hợp lệ',
  })
  code: string;
}
