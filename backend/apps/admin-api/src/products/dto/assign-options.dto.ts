import { IsArray, IsUUID } from 'class-validator';

export class AssignOptionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds: string[];
}
