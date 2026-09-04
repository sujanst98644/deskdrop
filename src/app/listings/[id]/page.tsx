import { prisma } from "@/db";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRs } from "@/lib/utils";
import { requestToBuyAction } from "@/lib/actions/order";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: ListingDetailPageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await getSession();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: true,
      category: true,
    },
  });

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.id === listing.sellerId;
  const isAvailable = listing.status === "AVAILABLE";

  const conditionLabels: Record<string, string> = {
    NEW: "New",
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {listing.images.slice(1).map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={img}
                    alt={`${listing.title} ${idx + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
            <Badge variant="secondary" className="capitalize">
              {conditionLabels[listing.condition] || listing.condition}
            </Badge>
          </div>

          <p className="text-3xl font-bold text-primary">{formatRs(listing.pricePaisa)}</p>

          {listing.campusCity && (
            <p className="text-muted-foreground">
              📍 {listing.campusCity}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{listing.category?.name || "Uncategorized"}</Badge>
            <Badge variant={listing.status === "AVAILABLE" ? "default" : "destructive"}>
              {listing.status}
            </Badge>
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold text-lg">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap mt-2">{listing.description}</p>
          </div>

          {/* Seller info */}
          <div className="border-t pt-4 mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {listing.seller.image ? (
                <Image
                  src={listing.seller.image}
                  alt={listing.seller.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <span className="text-sm font-semibold">{listing.seller.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-medium">{listing.seller.name}</p>
              <Link
                href={`/sellers/${listing.seller.id}`}
                className="text-sm text-primary hover:underline"
              >
                View profile
              </Link>
            </div>
          </div>

          {/* Actions */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {session ? (
            isOwner ? (
              <div className="flex gap-3 pt-4">
                <Link href={`/sell/edit/${listing.id}`}>
                  <Button variant="outline">Edit listing</Button>
                </Link>
                {/* Future: delete button */}
              </div>
            ) : isAvailable ? (
              <form action={requestToBuyAction} className="mt-4">
                <input type="hidden" name="listingId" value={listing.id} />
                <Button type="submit" className="w-full">
                  Request to buy
                </Button>
              </form>
            ) : (
              <Button disabled className="w-full mt-4">
                {listing.status === "SOLD" ? "Sold" : "Unavailable"}
              </Button>
            )
          ) : (
            <div className="pt-4">
              <Link href={`/sign-in?callbackUrl=/listings/${listing.id}`}>
                <Button className="w-full">Sign in to request</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}