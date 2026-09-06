import { prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { formatRs } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, PackageOpen, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { conditionLabel, statusLabel } from "@/lib/listing-labels";

export default async function MyListingsPage() {
  const session = await requireSession();

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {listings.length} listing{listings.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          className="h-10"
          nativeButton={false}
          render={<Link href="/sell/new" />}
        >
          <Plus />
          New listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="You haven't listed anything yet"
          description="Anything you put up for sale will show up here."
          action={
            <Button
              className="h-10"
              nativeButton={false}
              render={<Link href="/sell/new" />}
            >
              <Plus />
              Create your first listing
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col overflow-hidden border border-border bg-card transition-shadow hover:shadow-2xs"
            >
              <Link href={`/listings/${listing.id}`} className="block flex-1">
                <div className="relative aspect-video bg-muted">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImageOff className="size-5" />
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 px-2 py-1 text-xs font-semibold ${
                      listing.status === "AVAILABLE"
                        ? "bg-success text-success-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {statusLabel(listing.status)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-sm font-medium">{listing.title}</h3>
                  <p className="mt-2 text-lg font-bold text-primary">{formatRs(listing.pricePaisa)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {listing.category?.name ?? "Uncategorised"} • {conditionLabel(listing.condition)}
                  </p>
                </div>
              </Link>
              <div className="flex gap-2 px-4 pb-4">
                <Button
                  variant="outline"
                  className="h-9 flex-1"
                  nativeButton={false}
                  render={<Link href={`/sell/edit/${listing.id}`} />}
                >
                  Edit
                </Button>
                <DeleteListingButton listingId={listing.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}