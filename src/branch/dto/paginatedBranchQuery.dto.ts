import { PaginatedQueryDto } from 'src/common/dto/paginatedQuery.dto';
import { IsOptional, IsString } from 'class-validator';

export class PaginatedBranchQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @IsString()
  countryId?: string;
}
