"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HeroSlide, type HeroSlideContent } from "./HeroSlide";

// Each slide makes its own point and sends you somewhere different — three
// slides of identical copy would just be a static hero paying for three images.
const slides: HeroSlideContent[] = [
  {
    image: "/old-book.jpg",
    imageAlt: "",
    eyebrow: "Deskdrop",
    title: "Buy and sell with fellow students",
    subtitle:
      "Textbooks, electronics, dorm essentials — find what you need or list your own in minutes.",
    primaryCta: { label: "Browse listings", href: "/browse" },
    secondaryCta: { label: "Sell an item", href: "/sell/new" },
  },
  {
    image: "/too-many-books.jpg",
    imageAlt: "",
    eyebrow: "Books",
    title: "Last term's textbooks, a fraction of the price",
    subtitle:
      "The reading list you need is already sitting on another student's shelf.",
    primaryCta: { label: "Shop books", href: "/browse?category=books" },
    secondaryCta: { label: "Sell your books", href: "/sell/new" },
  },
  {
    image: "/electronics.jpg",
    imageAlt: "",
    eyebrow: "Electronics",
    title: "Calculators, laptops, headphones",
    subtitle:
      "Kit that graduated with its last owner and still has plenty of terms left in it.",
    primaryCta: { label: "Shop electronics", href: "/browse?category=electronics" },
    secondaryCta: { label: "Sell an item", href: "/sell/new" },
  },
];

export function HeroSection() {
  // Autoplay pauses itself while the pointer is over the hero or focus is
  // inside it, and resumes on the way out.
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );

  // Nothing should move on its own for someone who asked the OS for less
  // motion (WCAG 2.2.2) — the arrows still work.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (!query.matches) return;
      autoplay.stop();
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [autoplay]);

  return (
    <Carousel
      plugins={[autoplay]}
      opts={{ loop: true }}
      className="w-full"
      aria-label="Featured on Deskdrop"
    >
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => (
          <CarouselItem
            key={slide.image}
            className="pl-0"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            <HeroSlide slide={slide} isFirst={index === 0} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        variant="ghost"
        className="left-4 size-11 bg-black/40 text-white hover:bg-black/60"
      />
      <CarouselNext
        variant="ghost"
        className="right-4 size-11 bg-black/40 text-white hover:bg-black/60"
      />
    </Carousel>
  );
}
