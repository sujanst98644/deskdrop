import Link from "next/link";
import Image from "next/image";
import { formatRs } from "@/lib/utils";

const conditionColor: Record<string, string> = {
  NEW: "bg-emerald-500",
  LIKE_NEW: "bg-blue-500",
  GOOD: "bg-orange-500",
  FAIR: "bg-neutral-500",
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
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <span
          className={`absolute left-2 top-0 px-2 pt-2 py-1 text-xs font-semibold text-white ${conditionColor[condition]}`}
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