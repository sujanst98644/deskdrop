"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { listingSchema } from "@deskdrop/validators";
import { ZodError } from "zod";

type ActionResult =
  | { success: true; listingId: string }
  | { success: false; errors: Record<string, string[]> };

export async function createListingAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, errors: { _form: ["You must be logged in"] } };
    }

    // 2. Parse form data
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priceRs: Number(formData.get("priceRs")),
      condition: formData.get("condition"),
      categoryId: formData.get("categoryId"),
      campusCity: formData.get("campusCity") || undefined,
      images: JSON.parse(formData.get("images") as string),
    };

    // 3. Validate with Zod
    const validated = listingSchema.parse(rawData);

    // 4. Convert Rs to Paisa
    const pricePaisa = Math.round(validated.priceRs * 100);

    // 5. Create listing in DB
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        title: validated.title,
        description: validated.description,
        pricePaisa,
        condition: validated.condition,
        categoryId: validated.categoryId,
        campusCity: validated.campusCity || null,
        images: validated.images,
        status: "AVAILABLE",
      },
    });

    // 6. Revalidate cache
    revalidatePath("/browse");
    revalidatePath("/dashboard/listings");

    // 7. Return the listing ID (client handles redirect)
    return { success: true, listingId: listing.id };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          const key = err.path[0] as string;
          if (!fieldErrors[key]) fieldErrors[key] = [];
          fieldErrors[key].push(err.message);
        }
      });
      return { success: false, errors: fieldErrors };
    }
    
    console.error("Create listing error:", error);
    return {
      success: false,
      errors: { _form: ["Something went wrong. Please try again."] },
    };
  }
}