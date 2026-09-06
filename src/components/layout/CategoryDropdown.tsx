"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Category = { id: string; name: string; slug: string };

export function CategoryDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={toggle}
        className="flex h-11 items-center gap-2 border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Categories <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-64 border border-input bg-background shadow-md">
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/browse?category=${c.slug}`}
                  className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                  onClick={() => setOpen(false)}
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
