import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageOff } from "lucide-react";
import { formatRs } from "@/lib/utils";
import { conditionLabel } from "@/lib/listing-labels";

const conditionColor: Record<string, string> = {
  NEW: "bg-success text-success-foreground",
  LIKE_NEW: "bg-info text-info-foreground",
  GOOD: "bg-warning text-warning-foreground",
  FAIR: "bg-foreground/85 text-background",
};

export function ListingCard({
  id,
  title,
  pricePaisa,
  condition,
  image,
  sellerName,
}: {
  id: string;
  title: string;
  pricePaisa: number;
  condition: keyof typeof conditionColor;
  image?: string | null;
  sellerName: string;
}) {
  return (
    <Link
      href={`/listings/${id}`}
      className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-shadow hover:shadow-2xs"
    >
      <div className="relative aspect-square bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-sm">No image</span>
          </div>
        )}
        <span
          className={`absolute left-2 top-2 px-2 py-1 text-xs font-semibold ${conditionColor[condition]}`}
        >
          {conditionLabel(condition)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Two lines are reserved whether or not the title needs them, so the
            price and footer line up across every card in a row. */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-lg font-bold text-primary">{formatRs(pricePaisa)}</p>
        <p className="mt-1 text-xs text-muted-foreground">by {sellerName}</p>

        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-muted-foreground">View details</span>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}