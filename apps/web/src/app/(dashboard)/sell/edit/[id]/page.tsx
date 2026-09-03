import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { EditListingForm } from "@/components/listings/EditListingForm";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
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
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Convert price to Rs (from paisa)
  const listingData = {
    ...listing,
    priceRs: listing.pricePaisa / 100,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      <EditListingForm listing={listingData} categories={categories} />
    </div>
  );
}