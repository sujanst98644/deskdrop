"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "electronics", label: "Electronics" },
  { id: "dorm", label: "Dorm" },
  { id: "stationery", label: "Stationery" },
];

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") || "all";

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.id)}
          className={cn(
            "px-4 py-2 border text-sm font-medium transition whitespace-nowrap",
            current === cat.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-muted"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}