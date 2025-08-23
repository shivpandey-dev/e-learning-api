import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { LessonType } from '../enums/LessonType.enum';
import { VideoProvider } from '../enums/VideoProvider.enum';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @ValidateIf((o) => o.type === LessonType.TEXT)
  @IsString()
  textContent?: string;

  @ValidateIf((o) => o.type === LessonType.VIDEO)
  @IsEnum(VideoProvider)
  videoProvider?: VideoProvider;

  @ValidateIf((o) => o.type === LessonType.VIDEO)
  @IsString()
  videoRefId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
