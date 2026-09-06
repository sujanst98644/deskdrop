import Link from "next/link";

interface ShowcaseCategory {
  id: string;
  name: string;
  slug: string;
  availableCount: number;
}

export function CategoryShowcase({ categories }: { categories: ShowcaseCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/browse?category=${category.slug}`}
          className="border border-border bg-card p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <span className="text-lg font-medium text-card-foreground">{category.name}</span>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.availableCount === 0
              ? "Nothing listed yet"
              : `${category.availableCount} item${category.availableCount === 1 ? "" : "s"} available`}
          </p>
        </Link>
      ))}
    </div>
  );
}
