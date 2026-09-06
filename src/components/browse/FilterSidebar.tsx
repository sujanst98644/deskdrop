"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/lib/form-styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];

  const content = (
    <div className="space-y-5">
      <div>
        <label htmlFor="filter-q" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</label>
        <input
          id="filter-q"
          type="text"
          placeholder="Search listings..."
          defaultValue={currentFilters.q}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              updateFilters("q", value);
            }
          }}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="filter-category" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
        <Select
          items={categoryOptions}
          value={currentFilters.category}
          onValueChange={(value) => updateFilters("category", String(value))}
        >
          <SelectTrigger id="filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="filter-condition" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Condition</label>
        <Select
          items={conditions}
          value={currentFilters.condition}
          onValueChange={(value) => updateFilters("condition", String(value))}
        >
          <SelectTrigger id="filter-condition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price range (Rs)</p>
        <div className="flex gap-2">
          <input
            type="number"
            aria-label="Minimum price"
            placeholder="Min"
            value={currentFilters.minPrice || ""}
            onChange={(e) => updateFilters("minPrice", e.target.value ? Number(e.target.value) : undefined)}
            className={cn(fieldClass, "w-1/2")}
          />
          <input
            type="number"
            aria-label="Maximum price"
            placeholder="Max"
            value={currentFilters.maxPrice || ""}
            onChange={(e) => updateFilters("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
            className={cn(fieldClass, "w-1/2")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-campus" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campus / City</label>
        <input
          id="filter-campus"
          type="text"
          placeholder="e.g. Kathmandu"
          defaultValue={currentFilters.campusCity}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              updateFilters("campusCity", value);
            }
          }}
          className={fieldClass}
        />
      </div>

      <div className="border-t border-border pt-5">
        <Button variant="outline" className="h-9 w-full" onClick={clearFilters}>
          Clear all filters
        </Button>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          }
        />
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