"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Category = { id: string; name: string; slug: string };
type Filters = {
  q: string;
  category: string;
  condition: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  campusCity: string;
  sort: string;
  page: number;
};

interface FilterSidebarProps {
  categories: Category[];
  currentFilters: Filters;
  mobile?: boolean;
}

const conditions = [
  { value: "all", label: "All conditions" },
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

export function FilterSidebar({ categories, currentFilters, mobile }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (key: string, value: string | number | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    // Reset page when filters change
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
    if (mobile) setIsOpen(false);
  };

  const clearFilters = () => {
    router.push("/browse");
    if (mobile) setIsOpen(false);
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Search</h3>
        <input
          type="text"
          placeholder="Search listings..."
          defaultValue={currentFilters.q}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              updateFilters("q", value);
            }
          }}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Category</h3>
        <select
          value={currentFilters.category}
          onChange={(e) => updateFilters("category", e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Condition</h3>
        <select
          value={currentFilters.condition}
          onChange={(e) => updateFilters("condition", e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {conditions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Price range (Rs)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentFilters.minPrice || ""}
            onChange={(e) => updateFilters("minPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentFilters.maxPrice || ""}
            onChange={(e) => updateFilters("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Campus / City</h3>
        <input
          type="text"
          placeholder="e.g. Kathmandu"
          defaultValue={currentFilters.campusCity}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              updateFilters("campusCity", value);
            }
          }}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear all filters
      </Button>
    </div>
  );

  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return <div>{content}</div>;
}