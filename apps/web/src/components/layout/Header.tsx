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
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Header({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const { data: session, status } = useSession();
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
          Desk<span className="text-orange-500">drop</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <ThemeToggle />
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
          {status === "loading" ? null : session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
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

        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <input
            type="search"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 flex-1 border border-r-0 border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="flex h-11 items-center gap-2 bg-orange-500 px-6 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </form>

        <Link
          href="/sell/new"
          className="flex items-center gap-2 whitespace-nowrap border border-black bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-colors dark:bg-white dark:text-black"
        >
          <ShoppingBag className="h-4 w-4" /> Sell an item
        </Link>
      </div>
    </header>
  );
}