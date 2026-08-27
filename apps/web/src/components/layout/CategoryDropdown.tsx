"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Category = { id: string; name: string; slug: string };

export function CategoryDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-2 border border-black px-4 py-2.5 text-sm font-medium hover:bg-neutral-50">
        Categories <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-64 border border-neutral-300 bg-white">
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/browse?category=${c.slug}`}
                  className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-orange-600"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}