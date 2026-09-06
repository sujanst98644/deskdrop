import { prisma } from "@/db";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroSection } from "@/components/home/HeroSection";
import { SectionHeader } from "@/components/home/SectionHeader";
import { AdBanner } from "@/components/home/AdBanner";
import { HowItWorks } from "@/components/home/HowItWorks";

function rowCap(index: number) {
  if (index < 4) return "";
  if (index < 6) return "hidden sm:block";
  return "hidden lg:block";
}

export default async function HomePage() {
  const newArrivals = await prisma.listing.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { seller: true },
  });

  return (
    <>
      <HeroSection />

      <section className="container py-10 md:py-14">
        <SectionHeader
          title="New arrivals"
          subtitle="Freshly listed items from your campus"
          link="/browse?sort=newest"
          linkText="View all"
        />
        {newArrivals.length === 0 ? (
          <div className="border border-dashed border-border bg-muted/30 py-10 text-center">
            <p className="text-muted-foreground">No listings yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to sell!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((listing, index) => (
              // Two rows at every width: the grid runs 2/3/4 columns, so the
              // 5th-6th cards only appear from `sm` and the 7th-8th from `lg`.
              <div key={listing.id} className={rowCap(index)}>
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  pricePaisa={listing.pricePaisa}
                  condition={listing.condition}
                  image={listing.images?.[0]}
                  sellerName={listing.seller.name}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <AdBanner
        title="That textbook isn't getting any newer"
        subtitle="List what you no longer use and have it sold before the term ends."
        ctaText="Sell an item"
        ctaLink="/sell/new"
        image="/ad-banner-1.jpg"
        imageAlt="Second-hand books and study gear"
      />

      <HowItWorks />
    </>
  );
}
