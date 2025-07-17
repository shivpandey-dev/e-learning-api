export function buildPaginationUrl(
  baseUrl: string,
  queryParams: Record<string, any>,
  targetPage: number,
): string {
  const url = new URL(baseUrl);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'page') {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set('page', targetPage.toString());

  return url.pathname + '?' + url.searchParams.toString();
}
