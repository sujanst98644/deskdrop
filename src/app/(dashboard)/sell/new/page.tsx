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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>
      <ListingForm categories={categories} />
    </div>
  );
}