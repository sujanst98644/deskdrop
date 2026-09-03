import { prisma } from "@deskdrop/db";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroSection } from "@/components/home/HeroSection";
import { SectionHeader } from "@/components/home/SectionHeader";
import { AdBanner } from "@/components/home/AdBanner";

export default async function HomePage() {
  
  const totalCount = await prisma.listing.count({
    where: { status: "AVAILABLE" },
  });


  const newArrivals = await prisma.listing.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { seller: true },
  });


  const flashSale = await prisma.listing.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 4,
    skip: Math.min(2, Math.max(0, totalCount - 4)), 
    include: { seller: true },
  });


  const trending = await prisma.listing.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 4,
    skip: Math.min(6, Math.max(0, totalCount - 4)),
    include: { seller: true },
  });


  const categories = await prisma.category.findMany({
    take: 4,
    orderBy: { name: "asc" },
  });


  const hasFlashSale = flashSale.length > 0;
  const hasTrending = trending.length > 0;

  return (
    <main className="space-y-6">
      {/* Hero */}
      <HeroSection />

      <div className="container">
      {/* Flash Sale – with timer badge */}
      <section className="container mx-auto px-4 pb-12">
        <SectionHeader
          title="Flash Sale"
          subtitle="Limited time deals – grab them before they're gone"
          link="/browse"
          linkText="View all"
        />
        {!hasFlashSale ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No flash sale items right now.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {flashSale.map((listing) => (
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
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 pb-12">
        <SectionHeader
          title="New Arrivals"
          subtitle="Freshly listed items from your campus"
          link="/browse?sort=newest"
          linkText="View all"
        />
        {newArrivals.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No listings yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to sell!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newArrivals.map((listing) => (
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
      </section>
      </div>
        <AdBanner
        title="Endless accessories. Epic prices."
        subtitle="Browse millions of upgrades for your ride."
        ctaText="Shop now"
        ctaLink="/browse?category=electronics"
        image="/ad-banner-1.jpg"
        imageAlt="Tech accessories"
        textAlign="left"
        
      />
      <div className="container">
      {/* Trending */}
      <section className="container mx-auto px-4 pb-12">
        <SectionHeader
          title="Trending"
          subtitle="What other students are buying"
          link="/browse"
          linkText="View all"
        />
        {!hasTrending ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No trending items yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trending.map((listing) => (
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
      </section>
      </div>
    </main>
  );
}