import { prisma } from "@deskdrop/db";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/browse/FilterSidebar";
import { SortDropdown } from "@/components/browse/SortDropdown";
import { Pagination } from "@/components/browse/Pagination";
import { getBrowseFilters } from "@/lib/utils/browse";

const ITEMS_PER_PAGE = 12;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters = getBrowseFilters(params);

  // Build where clause
  const where: any = {
    status: "AVAILABLE",
  };

  // Search (title or description)
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  // Category
  if (filters.category && filters.category !== "all") {
    where.category = { slug: filters.category };
  }

  // Condition
  if (filters.condition && filters.condition !== "all") {
    where.condition = filters.condition;
  }

  // Price range
  if (filters.minPrice !== undefined) {
    where.pricePaisa = { gte: filters.minPrice * 100 };
  }
  if (filters.maxPrice !== undefined) {
    where.pricePaisa = { ...where.pricePaisa, lte: filters.maxPrice * 100 };
  }

  // Campus city
  if (filters.campusCity) {
    where.campusCity = { contains: filters.campusCity, mode: "insensitive" };
  }

  // Sorting
  const orderBy: any = {};
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
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar categories={categories} currentFilters={filters} />
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "listing" : "listings"} found
            </p>
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
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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