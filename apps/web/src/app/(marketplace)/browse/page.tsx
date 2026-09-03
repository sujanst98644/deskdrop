import { prisma } from "@deskdrop/db";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroSection } from "@/components/home/HeroSection";

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
    <div className=" gap-6 py-8">
      <HeroSection />
      <div className="container flex-1 mt-10">
        <h1 className="text-xl font-bold">Browse listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{listings.length} available</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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