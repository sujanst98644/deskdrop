import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatRs } from "@/lib/utils";

const conditionColor: Record<string, string> = {
  NEW: "bg-success text-success-foreground",
  LIKE_NEW: "bg-info text-info-foreground",
  GOOD: "bg-warning text-warning-foreground",
  FAIR: "bg-foreground/85 text-background",
};

const conditionLabel: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
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
      className="group block overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-muted">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-sm">No image</span>
          </div>
        )}
        <span
          className={`absolute left-2 top-2 px-2 py-1 text-xs font-semibold ${conditionColor[condition]}`}
        >
          {conditionLabel[condition]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-2 text-lg font-bold text-primary">{formatRs(pricePaisa)}</p>
        <p className="mt-1 text-xs text-muted-foreground">by {sellerName}</p>

        {/* Simple visual indicator – no interactivity needed */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">View details</span>
          <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}