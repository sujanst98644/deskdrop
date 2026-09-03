"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

// --- Request to Buy ---
export async function requestToBuyAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    const listingId = formData.get("listingId") as string;
    if (!listingId) {
      return { success: false, error: "Listing ID is required" };
    }

    // Fetch the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Validate
    if (listing.status !== "AVAILABLE") {
      return { success: false, error: "This listing is no longer available" };
    }

    if (listing.sellerId === session.user.id) {
      return { success: false, error: "You cannot buy your own item" };
    }

    // Check for existing pending order
    const existingOrder = await prisma.order.findFirst({
      where: {
        listingId: listing.id,
        buyerId: session.user.id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existingOrder) {
      return { success: false, error: "You already have a pending request for this item" };
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/listings/${listing.id}`);

    // Redirect to orders page
    redirect("/dashboard/orders");
  } catch (error) {
    console.error("Request to buy error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// --- Update Order Status ---
export async function updateOrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: "ACCEPTED" | "CANCELLED" | "COMPLETED";
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Fetch order with listing
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Authorization
    if (status === "CANCELLED") {
      // Buyer can cancel only if pending
      if (order.buyerId !== session.user.id) {
        return { success: false, error: "Only the buyer can cancel" };
      }
      if (order.status !== "PENDING") {
        return { success: false, error: "This order cannot be cancelled" };
      }
    } else if (status === "ACCEPTED" || status === "COMPLETED") {
      // Seller can accept/complete
      if (order.sellerId !== session.user.id) {
        return { success: false, error: "Only the seller can perform this action" };
      }
      if (status === "ACCEPTED" && order.status !== "PENDING") {
        return { success: false, error: "Order must be pending to accept" };
      }
      if (status === "COMPLETED" && order.status !== "ACCEPTED") {
        return { success: false, error: "Order must be accepted to complete" };
      }
    }

    // 3. If completing, also mark listing as sold
    if (status === "COMPLETED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" },
        }),
        prisma.listing.update({
          where: { id: order.listingId },
          data: { status: "SOLD" },
        }),
      ]);
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/listings/${order.listingId}`);

    return { success: true };
  } catch (error) {
    console.error("Order status update error:", error);
    return { success: false, error: "Something went wrong" };
  }
}