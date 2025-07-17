import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { SortOrder } from '../dto/paginatedQuery.dto';
import {
  PaginatedResponseDto,
  PaginationLinks,
  PaginationMeta,
} from '../dto/paginatedResponse.dto';
import { buildPaginationUrl } from './buildPaginationUrl';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  searchableColumns?: string[];
  filters?: Record<string, string>;
  sortBy?: string;
  order?: SortOrder;
  route?: string;
  queryParams?: Record<string, string | string[]>; // 👈 NEW for building full URL with all filters
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions,
): Promise<PaginatedResponseDto<T>> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;

  // Search
  if (options.searchTerm && options.searchableColumns?.length) {
    qb.andWhere(
      new Brackets((qbWhere) => {
        for (const column of options.searchableColumns!) {
          qbWhere.orWhere(`${qb.alias}.${column} ILIKE :search`, {
            search: `%${options.searchTerm}%`,
          });
        }
      }),
    );
  }

  // Filters
  if (options.filters) {
    for (const [field, value] of Object.entries(options.filters)) {
      qb.andWhere(`${qb.alias}.${field} = :${field}`, { [field]: value });
    }
  }

  // Sorting
  if (options.sortBy) {
    qb.orderBy(`${qb.alias}.${options.sortBy}`, options.order ?? SortOrder.ASC);
  }

  const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

  const meta: PaginationMeta = {
    totalItems: total,
    itemCount: data.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };

  const links: PaginationLinks = {
    next:
      page < meta.totalPages && options.route
        ? buildPaginationUrl(options.route, options.queryParams ?? {}, page + 1)
        : null,
    previous:
      page > 1 && options.route
        ? buildPaginationUrl(options.route, options.queryParams ?? {}, page - 1)
        : null,
  };

  return new PaginatedResponseDto<T>(data, meta, links);
}
