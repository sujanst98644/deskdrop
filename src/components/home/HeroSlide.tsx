import Link from "next/link";
import Image from "next/image";

interface HeroSlideProps {
  image: string;
}

export function HeroSlide({ image }: HeroSlideProps) {
  return (
    <section className="relative w-full min-h-[50vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt="Campus scene"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content – exactly as you had it, left-aligned */}
      <div className="relative z-10 max-w-xl px-8 md:px-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Deskdrop
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
          Buy and sell with fellow students
        </h1>
        <p className="mt-4 text-white/80">
          Textbooks, electronics, dorm essentials — find it on campus or list
          your own in minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="px-6 py-3 text-sm font-medium text-white bg-black hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 transition"
          >
            Browse listings
          </Link>
          <Link
            href="/sell/new"
            className="px-6 py-3 text-sm font-medium text-black bg-white  hover:bg-neutral-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-black/80 transition"
          >
            Sell an item
          </Link>
        </div>
      </div>
    </section>
  );
}
