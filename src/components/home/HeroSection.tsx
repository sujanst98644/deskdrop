"use client";

import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HeroSlide } from "./HeroSlide";

const slides = [
  {
    image: "/old-book.jpg",
  },
  {
    image: "/too-many-books.jpg",
  },
  {
    image: "/electronics.jpg",
  },
];

export function HeroSection() {
  const [plugin] = useState(() =>
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin]}
      className="w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <HeroSlide image={slide.image} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}