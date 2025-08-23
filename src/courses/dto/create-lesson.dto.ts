import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { LessonType } from '../enums/LessonType.enum';
import { VideoProvider } from '../enums/VideoProvider.enum';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @IsEnum(LessonType)
  type: LessonType;

  // TEXT
  @ValidateIf((o) => o.type === LessonType.TEXT)
  @IsString()
  @IsNotEmpty()
  textContent?: string;

  // VIDEO
  @ValidateIf((o) => o.type === LessonType.VIDEO)
  @IsEnum(VideoProvider)
  videoProvider?: VideoProvider;

  @ValidateIf((o) => o.type === LessonType.VIDEO)
  @IsString()
  @IsNotEmpty()
  videoRefId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
