"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="space-y-2">
      {/* Capped against the viewport so the whole listing fits on one screen
          on a laptop; the ratio still governs on narrow screens, where the cap
          never binds. */}
      <div className="relative aspect-[4/3] max-h-[48vh] overflow-hidden border border-border bg-muted">
        {active ? (
          <Image
            key={active}
            src={active}
            alt={`${title} — image ${activeIndex + 1} of ${images.length}`}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            // `contain`, not `cover`: a buyer needs to see the whole item, and
            // listing photos come in every aspect ratio.
            className="object-contain"
            preload
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="text-sm">No photos yet</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border bg-muted transition-colors",
                  index === activeIndex
                    ? "border-primary"
                    : "border-border hover:border-foreground/40"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
