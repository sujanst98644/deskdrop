import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface AdBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string; // path to image in public/ or external URL
  imageAlt: string;
  textAlign?: "left" | "center";
}

export function AdBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  image,
  imageAlt,
  textAlign = "left",
}: AdBannerProps) {
  const isCentered = textAlign === "center";

  return (
    <section className="container">
      <div className="relative overflow-hidden px-6 py-16 md:px-12 md:py-20">
        <Image src={image} alt={imageAlt} fill sizes="100vw" className="object-cover" />
        <div className="media-scrim" />

        <div
          className={`relative max-w-2xl ${isCentered ? "mx-auto text-center" : "text-left"}`}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-white/80">{subtitle}</p>
          <Link
            href={ctaLink}
            className="mt-6 inline-flex items-center gap-2 bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ctaText}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
