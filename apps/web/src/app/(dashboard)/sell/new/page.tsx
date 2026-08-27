import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listings/ListingForm";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  // Fetch categories for the dropdown
  const categories = await prisma.category.findMany({
    where: { isActive: true },
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