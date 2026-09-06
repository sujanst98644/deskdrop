import Link from "next/link";
import Image from "next/image";

export interface HeroSlideContent {
  image: string;
  /** Empty alt when the photo is purely decorative behind the headline. */
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export function HeroSlide({
  slide,
  isFirst = false,
}: {
  slide: HeroSlideContent;
  /** The first slide carries the page's <h1> and is the only one worth preloading. */
  isFirst?: boolean;
}) {
  const Heading = isFirst ? "h1" : "h2";

  return (
    <div className="relative flex min-h-[26rem] w-full items-center overflow-hidden md:min-h-[32rem]">
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-top"
        preload={isFirst}
      />
      <div className="media-scrim" />

      <div className="relative max-w-xl px-8 md:px-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          {slide.eyebrow}
        </p>
        <Heading className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
          {slide.title}
        </Heading>
        <p className="mt-4 text-white/80">{slide.subtitle}</p>

        {/* Sitting on the scrim, these are a fixed dark context — black and white
            stay put in both themes rather than following the page tokens. */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={slide.primaryCta.href}
            className="bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
          >
            {slide.primaryCta.label}
          </Link>
          <Link
            href={slide.secondaryCta.href}
            className="bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            {slide.secondaryCta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
