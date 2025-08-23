import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from 'src/common/dto/paginatedQuery.dto';

export class PaginatedCourseQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsBooleanString()
  includeDrafts?: string; // 'true' to include isPublished=false
}
