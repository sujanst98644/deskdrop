import { prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { formatRs } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { DeleteListingButton } from "@/components/listings/DeleteListingButton";

export default async function MyListingsPage() {
  const session = await requireSession();

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link
          href="/sell/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven&apos;t listed anything yet.</p>
          <Link href="/sell/new" className="text-primary hover:underline mt-2 inline-block">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border border-border overflow-hidden bg-card hover:shadow-md transition"
            >
              <Link href={`/listings/${listing.id}`} className="block">
                <div className="relative aspect-video bg-muted">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      listing.status === "AVAILABLE"
                        ? "bg-green-500 text-white"
                        : "bg-neutral-500 text-white"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-1">{listing.title}</h3>
                  <p className="text-primary font-bold mt-1">{formatRs(listing.pricePaisa)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {listing.category?.name} • {listing.condition}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <Link
                  href={`/sell/edit/${listing.id}`}
                  className="flex-1 text-center text-sm border border-input rounded-md py-1.5 hover:bg-muted transition"
                >
                  Edit
                </Link>
                <DeleteListingButton listingId={listing.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}