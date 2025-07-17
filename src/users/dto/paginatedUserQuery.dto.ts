import { PaginatedQueryDto } from 'src/common/dto/paginatedQuery.dto';
import { IsOptional, IsString } from 'class-validator';

export class PaginatedUserQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
