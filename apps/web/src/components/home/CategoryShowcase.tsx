import Link from "next/link";

export function CategoryShowcase({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/browse?category=${cat.slug}`}
          className="block p-6 text-center border rounded-lg hover:shadow-md transition bg-card hover:bg-muted"
        >
          <span className="text-lg font-medium">{cat.name}</span>
          <p className="text-sm text-muted-foreground mt-1">Browse items</p>
        </Link>
      ))}
    </div>
  );
}