import { prisma, type Prisma } from "@/db";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/browse/FilterSidebar";
import { SortDropdown } from "@/components/browse/SortDropdown";
import { Pagination } from "@/components/browse/Pagination";
import { getBrowseFilters } from "@/lib/browse";
import { conditionEnum } from "@/lib/validations";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories } from "@/lib/categories";

const ITEMS_PER_PAGE = 12;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters = getBrowseFilters(params);

  const where: Prisma.ListingWhereInput = {
    status: "AVAILABLE",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  
  if (filters.category && filters.category !== "all") {
    where.category = { slug: filters.category };
  }

  const condition = conditionEnum.safeParse(filters.condition);
  if (condition.success) {
    where.condition = condition.data;
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.pricePaisa = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice * 100 } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice * 100 } : {}),
    };
  }

  if (filters.campusCity) {
    where.campusCity = { contains: filters.campusCity, mode: "insensitive" };
  }

  // Sorting
  const orderBy: Prisma.ListingOrderByWithRelationInput = {};
  switch (filters.sort) {
    case "price-asc":
      orderBy.pricePaisa = "asc";
      break;
    case "price-desc":
      orderBy.pricePaisa = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  // Pagination
  const page = Math.max(1, filters.page || 1);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Fetch listings and count
  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: { seller: true, category: true },
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Categories for filter dropdown
  const categories = await getCategories();

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6">
            <h2 className="mb-4 text-lg font-semibold">Filters</h2>
            <FilterSidebar categories={categories} currentFilters={filters} />
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <SortDropdown currentSort={filters.sort} />
              <FilterSidebar
                categories={categories}
                currentFilters={filters}
                mobile
              />
            </div>
          </div>

          {listings.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No listings found"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  pricePaisa={listing.pricePaisa}
                  condition={listing.condition}
                  image={listing.images?.[0]}
                  sellerName={listing.seller.name}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}