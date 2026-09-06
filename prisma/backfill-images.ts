/**
 * One-off migration: listing photos used to be stored as base64 `data:` URIs
 * directly in `listings.images`, which made every listing query pull megabytes
 * out of Postgres. This uploads each of those blobs to ImageKit and rewrites
 * the column to the CDN URL.
 *
 * Run with: bun run db:backfill-images
 * Safe to re-run — rows whose images are already https URLs are skipped.
 */
import "dotenv/config";

import { prisma } from "../src/db";
import { createImageKit, getImageKitConfig, LISTINGS_FOLDER } from "../src/lib/imagekit";

/** Splits `data:image/png;base64,AAAA` into its mime type and payload. */
function parseDataUri(value: string) {
  const comma = value.indexOf(",");
  if (comma === -1) return null;
  const header = value.slice(5, comma); // after "data:"
  const data = value.slice(comma + 1);
  if (!data) return null;
  return { mime: header.replace(/;base64$/, "") || "image/jpeg", data };
}

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function main() {
  const config = getImageKitConfig();
  if (!config) {
    throw new Error(
      "ImageKit is not configured — set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT."
    );
  }
  const imagekit = createImageKit(config);

  const listings = await prisma.listing.findMany({
    select: { id: true, title: true, images: true },
  });

  let migrated = 0;
  let skipped = 0;

  for (const listing of listings) {
    if (!listing.images.some((image) => image.startsWith("data:"))) {
      skipped++;
      continue;
    }

    const next: string[] = [];
    for (const [index, image] of listing.images.entries()) {
      if (!image.startsWith("data:")) {
        next.push(image);
        continue;
      }

      const parsed = parseDataUri(image);
      if (!parsed) {
        console.warn(`  ! ${listing.id} image ${index}: unparseable, dropping`);
        continue;
      }

      const extension = EXTENSIONS[parsed.mime] ?? "jpg";
      const kb = Math.round(image.length / 1024);

      const uploaded = await imagekit.upload({
        file: parsed.data, // base64 payload, without the data: prefix
        fileName: `${listing.id}-${index}.${extension}`,
        folder: LISTINGS_FOLDER,
        useUniqueFileName: true,
      });

      console.log(`  ${listing.title.slice(0, 40)} [${index}] ${kb}KB -> ${uploaded.url}`);
      next.push(uploaded.url);
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { images: next },
    });
    migrated++;
  }

  console.log(`\nDone. ${migrated} listing(s) migrated, ${skipped} already clean.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
