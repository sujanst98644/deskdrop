"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryDropdown } from "./CategoryDropdown";
import Link from "next/link";
import {
  Search,
  Heart,
  Package,
  ShoppingBag,
  User,
  ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/lib/form-styles";

export function Header({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  return (
    <header className="bg-background border-b border-border">
      {/* Top utility row */}
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Desk<span className="text-primary">drop</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/dashboard/listings"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart className="h-4 w-4" /> My Listings
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Package className="h-4 w-4" /> My Orders
          </Link>
          {isPending ? null : session ? (
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" /> {session.user?.name}{" "}
              <ChevronDown className="h-3 w-3" />
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" /> Sign in
            </Link>
          )}
        </nav>
      </div>

      {/* Search row */}
      <div className="container flex h-16 items-center gap-4">
        <CategoryDropdown categories={categories} />

        <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center">
          <input
            type="search"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(fieldClass, "h-11 flex-1 border-r-0 px-4 py-0")}
          />
          <button
            type="submit"
            className="flex h-11 items-center gap-2 bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </form>

        <Link
          href="/sell/new"
          className="flex h-11 items-center gap-2 whitespace-nowrap bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" /> Sell an item
        </Link>
      </div>
    </header>
  );
}