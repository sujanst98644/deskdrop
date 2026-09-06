import { prisma } from "@/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ListingCard } from "@/components/listings/ListingCard";
import { CalendarDays, Package, PackageOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4 border-b border-border pb-8">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden bg-muted">
          {user.image ? (
            <Image src={user.image} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-4" />
              {user.listings.length} active listing
              {user.listings.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {user.listings.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No active listings"
          description="This seller doesn't have anything for sale right now."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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