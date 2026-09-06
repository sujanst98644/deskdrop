import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/db";

/** Revalidate target for anything that changes the category list. */
export const CATEGORIES_TAG = "categories";

/**
 * The category list, read by the header on every page in the app.
 *
 * It changes about never, so it is cached rather than queried per request —
 * `max` keeps it long enough to live in each route's static shell. Anything
 * that edits categories should call `revalidateTag(CATEGORIES_TAG)`.
 */
export async function getCategories() {
  "use cache";
  cacheLife("max");
  cacheTag(CATEGORIES_TAG);

  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
