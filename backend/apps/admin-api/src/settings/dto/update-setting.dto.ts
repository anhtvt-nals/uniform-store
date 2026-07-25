import { IsString, IsOptional } from 'class-validator';

export class UpdateSettingDto {
    @IsString()
    key: string;

    @IsOptional()
    value: any;
}
