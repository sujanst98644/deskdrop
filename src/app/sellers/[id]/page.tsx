import { prisma } from "@/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ListingCard } from "@/components/listings/ListingCard";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt={user.name} width={80} height={80} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.listings.length} active listings
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Listings by {user.name}</h2>
      {user.listings.length === 0 ? (
        <p className="text-muted-foreground">This user has no active listings.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {user.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              pricePaisa={listing.pricePaisa}
              condition={listing.condition}
              image={listing.images?.[0]}
              sellerName={user.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}