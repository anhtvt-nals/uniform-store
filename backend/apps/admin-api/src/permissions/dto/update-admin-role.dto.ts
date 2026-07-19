import { IsString, IsIn } from 'class-validator';

export class UpdateAdminRoleDto {
  @IsString()
  @IsIn(['super_admin', 'admin', 'editor'])
  role: string;
}
