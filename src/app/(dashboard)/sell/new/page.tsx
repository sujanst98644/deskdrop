import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/db";
import { ListingForm } from "@/components/listings/ListingForm";

export default async function NewListingPage() {
  await requireSession();

  // Fetch all categories – remove the `where` condition
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Sell an item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a few photos and a price — it takes a couple of minutes.
        </p>
        <div className="mt-6 border border-border bg-card p-6 md:p-8">
          <ListingForm categories={categories} />
        </div>
      </div>
    </div>
  );
}