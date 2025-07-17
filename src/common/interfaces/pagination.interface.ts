export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginationLinks {
  next?: string | null;
  previous?: string | null;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}
