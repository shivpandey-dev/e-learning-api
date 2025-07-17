export class PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class PaginationLinks {
  next?: string | null;
  previous?: string | null;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;

  constructor(data: T[], meta: PaginationMeta, links: PaginationLinks) {
    this.data = data;
    this.meta = meta;
    this.links = links;
  }
}
