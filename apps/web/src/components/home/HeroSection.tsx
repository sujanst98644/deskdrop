import Link from "next/link";

export function HeroSection() {
  return (
    <section className="border border-neutral-300 bg-neutral-50 px-8 py-14 md:px-16 md:py-20">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Deskdrop
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">
          Buy and sell with fellow students
        </h1>
        <p className="mt-4 text-neutral-600">
          Textbooks, electronics, dorm essentials — find it on campus or list
          your own in minutes.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/browse"
            className="border border-black bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Browse listings
          </Link>
          <Link
            href="/sell/new"
            className="border border-black px-6 py-3 text-sm font-medium hover:bg-neutral-100"
          >
            Sell an item
          </Link>
        </div>
      </div>
    </section>
  );
}