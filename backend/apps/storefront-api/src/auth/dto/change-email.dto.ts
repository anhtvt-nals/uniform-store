import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'newemail@example.com' })
  @IsEmail()
  newEmailAddress: string;
}
