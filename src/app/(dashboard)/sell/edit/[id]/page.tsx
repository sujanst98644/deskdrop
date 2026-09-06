import { prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { notFound, redirect } from "next/navigation";
import { EditListingForm } from "@/components/listings/EditListingForm";
import { getCategories } from "@/lib/categories";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!listing) {
    notFound();
  }

  // Check ownership
  if (listing.sellerId !== session.user.id) {
    redirect("/dashboard/listings");
  }

  // Only allow editing if not sold
  if (listing.status === "SOLD") {
    redirect("/dashboard/listings");
  }

  // Fetch categories for dropdown
  const categories = await getCategories();

  // Convert price to Rs (from paisa)
  const listingData = {
    ...listing,
    categoryId: listing.categoryId ?? "",
    priceRs: listing.pricePaisa / 100,
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Edit listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes go live as soon as you save.
        </p>
        <div className="mt-6 border border-border bg-card p-6 md:p-8">
          <EditListingForm listing={listingData} categories={categories} />
        </div>
      </div>
    </div>
  );
}