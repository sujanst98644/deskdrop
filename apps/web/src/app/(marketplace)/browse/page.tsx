import { prisma } from "@deskdrop/db";
import { ListingCard } from "@/components/listings/ListingCard";

export default async function BrowsePage() {
  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "AVAILABLE" },
      include: { seller: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="container flex gap-6 py-8">
      <aside className="hidden w-56 shrink-0 rounded-lg border bg-card p-4 md:block">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Categories</h2>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id}>
              <a href={`/browse?category=${c.slug}`} className="block rounded px-2 py-1.5 text-sm hover:bg-accent">
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1">
        <h1 className="text-xl font-bold">Browse listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{listings.length} available</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              pricePaisa={listing.pricePaisa}
              condition={listing.condition}
              image={listing.images[0]}
              sellerName={listing.seller.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}