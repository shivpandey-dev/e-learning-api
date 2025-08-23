import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../enums/SortOrder.enum';

export class PaginatedQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}
