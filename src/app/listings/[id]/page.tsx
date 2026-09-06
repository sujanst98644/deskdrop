import { prisma } from "@/db";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  MapPin,
  MessageSquare,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { formatRs } from "@/lib/utils";
import { requestToBuyAction } from "@/lib/actions/order";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

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
  const condition = conditionLabels[listing.condition] ?? listing.condition;
  const listedOn = listing.createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const details = [
    { icon: Sparkles, label: "Condition", value: condition },
    { icon: Tag, label: "Category", value: listing.category?.name ?? "Uncategorised" },
    ...(listing.campusCity
      ? [{ icon: MapPin, label: "Campus / City", value: listing.campusCity }]
      : []),
    { icon: CalendarDays, label: "Listed", value: listedOn },
  ];

  return (
    <div className="container py-5 md:py-6">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to browse
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ListingGallery images={listing.images ?? []} title={listing.title} />

        <div className="space-y-5">
          <div>
            {isAvailable ? (
              <Badge
                variant="outline"
                className="border-success/40 bg-success/10 text-success"
              >
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">Sold</Badge>
            )}

            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-4xl font-bold tracking-tight text-primary">
              {formatRs(listing.pricePaisa)}
            </p>
          </div>

          {/* The specs carry condition, category and campus, so the header does
              not repeat them as badges. */}
          <dl className="divide-y divide-border border-y border-border text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center gap-3 py-2.5">
                <detail.icon className="size-4 shrink-0 text-muted-foreground" />
                <dt className="w-28 shrink-0 text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="min-w-0 flex-1 font-medium">{detail.value}</dd>
              </div>
            ))}
          </dl>

          {error && (
            <p className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          {/* Kept above the description: the action is the point of the page. */}
          {session ? (
            isOwner ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                render={<Link href={`/sell/edit/${listing.id}`} />}
              >
                Edit listing
              </Button>
            ) : isAvailable ? (
              <form action={requestToBuyAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <Button type="submit" size="lg" className="w-full">
                  Request to buy
                </Button>
              </form>
            ) : (
              <Button disabled size="lg" className="w-full">
                {listing.status === "SOLD" ? "Sold" : "Unavailable"}
              </Button>
            )
          ) : (
            <Button
              size="lg"
              className="w-full"
              render={<Link href={`/sign-in?callbackUrl=/listings/${listing.id}`} />}
            >
              Sign in to request
            </Button>
          )}

          <div className="border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden bg-muted">
                {listing.seller.image ? (
                  <Image
                    src={listing.seller.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Sold by</p>
                <p className="truncate font-medium">{listing.seller.name}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-9"
                render={<Link href={`/sellers/${listing.seller.id}`} />}
              >
                <User />
                View profile
              </Button>
              {/* Placeholder: messaging is not built yet, so the control is
                  present but disabled rather than pretending to work. */}
              <Button
                variant="outline"
                className="h-9"
                disabled
                title="Messaging isn't available yet"
              >
                <MessageSquare />
                Message
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
