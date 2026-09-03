import Link from "next/link";
import Image from "next/image";

interface AdBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string; // path to image in public/ or external URL
  imageAlt: string;
  textAlign?: "left" | "center" | "right";
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
  const textAlignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[textAlign];

  return (
    <section className="container relative w-full py-16 md:py-20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 ${textAlignClass}`}>
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {title}
          </h2>
          <p className="mt-3 text-lg text-white/80">
            {subtitle}
          </p>
          <Link
            href={ctaLink}
            className="inline-block mt-6 bg-white text-black px-8 py-3 font-medium hover:bg-gray-100 transition"
          >
            {ctaText} →
          </Link>
        </div>
      </div>
    </section>
  );
}