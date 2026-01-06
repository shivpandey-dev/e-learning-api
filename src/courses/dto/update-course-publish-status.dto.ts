import { IsBoolean } from 'class-validator';

export class UpdateCoursePublishStatusDto {
  @IsBoolean()
  isPublished: boolean;
}
