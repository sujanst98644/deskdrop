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

export async function deleteListingAction({
  listingId,
}: {
  listingId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    if (listing.sellerId !== session.user.id) {
      return { success: false, error: "You don't own this listing" };
    }

    // Only allow deletion if draft or available (not sold)
    if (listing.status === "SOLD") {
      return { success: false, error: "Cannot delete a sold listing" };
    }

    await prisma.listing.delete({
      where: { id: listingId },
    });

    revalidatePath("/dashboard/listings");
    return { success: true };
  } catch (error) {
    console.error("Delete listing error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateListingAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, errors: { _form: ["You must be logged in"] } };
    }

    const listingId = formData.get("listingId") as string;
    if (!listingId) {
      return { success: false, errors: { _form: ["Listing ID is required"] } };
    }

    // Fetch existing listing
    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true, status: true },
    });

    if (!existing) {
      return { success: false, errors: { _form: ["Listing not found"] } };
    }

    if (existing.sellerId !== session.user.id) {
      return { success: false, errors: { _form: ["You don't own this listing"] } };
    }

    if (existing.status === "SOLD") {
      return { success: false, errors: { _form: ["Cannot edit a sold listing"] } };
    }

    // Parse form data
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priceRs: Number(formData.get("priceRs")),
      condition: formData.get("condition"),
      categoryId: formData.get("categoryId"),
      campusCity: formData.get("campusCity") || undefined,
      images: JSON.parse(formData.get("images") as string),
    };

    const validated = listingSchema.parse(rawData);
    const pricePaisa = Math.round(validated.priceRs * 100);

    // Update listing
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        title: validated.title,
        description: validated.description,
        pricePaisa,
        condition: validated.condition,
        categoryId: validated.categoryId,
        campusCity: validated.campusCity || null,
        images: validated.images,
      },
    });

    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/dashboard/listings");

    return { success: true, listingId };
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
    console.error("Update listing error:", error);
    return {
      success: false,
      errors: { _form: ["Something went wrong. Please try again."] },
    };
  }
}