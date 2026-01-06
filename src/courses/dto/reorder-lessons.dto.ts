import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class ReorderLessonsDto {
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  lessonIds: string[]; // ordered list of lesson IDs
}
