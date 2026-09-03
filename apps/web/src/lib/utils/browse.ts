type Filters = {
  q: string;
  category: string;
  condition: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  campusCity: string;
  sort: string;
  page: number;
};

export function getBrowseFilters(
  params: { [key: string]: string | string[] | undefined }
): Filters {
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const condition = typeof params.condition === "string" ? params.condition : "all";
  const minPrice = typeof params.minPrice === "string" ? parseFloat(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? parseFloat(params.maxPrice) : undefined;
  const campusCity = typeof params.campusCity === "string" ? params.campusCity : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return { q, category, condition, minPrice, maxPrice, campusCity, sort, page };
}