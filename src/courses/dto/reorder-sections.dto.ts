import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class ReorderSectionsDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  sectionIds: string[]; // ordered list of section IDs
}
