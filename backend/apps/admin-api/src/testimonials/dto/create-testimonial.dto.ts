import {IsBoolean, IsInt, IsOptional, IsString, Max, Min} from 'class-validator';

export class CreateTestimonialDto {
  @IsString() content: string;
  @IsString() author: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
