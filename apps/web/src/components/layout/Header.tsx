"use client";

import Link from "next/link";
import { Search, Heart, Package, ShoppingBag, User, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-background">
      {/* Top utility row */}
      <div className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/browse" className="text-xl font-bold tracking-tight">
            Desk<span className="text-orange-500">drop</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard/listings" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Heart className="h-4 w-4" /> My Listings
            </Link>
            <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Package className="h-4 w-4" /> My Orders
            </Link>
            {status === "loading" ? null : session ? (
              <button onClick={() => signOut({ callbackUrl: "/browse" })} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" /> {session.user?.name} <ChevronDown className="h-3 w-3" />
              </button>
            ) : (
              <Link href="/sign-in" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" /> Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Search row */}
      <div className="container flex h-16 items-center gap-4">
        <button className="flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-accent">
          <span className="text-lg">☰</span> Categories
        </button>

        <div className="flex flex-1 items-center">
          <input
            type="search"
            placeholder="What are you looking for?"
            className="h-11 flex-1 rounded-l-md border border-r-0 border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="flex h-11 items-center gap-2 rounded-r-md bg-orange-500 px-6 text-sm font-medium text-white hover:bg-orange-600">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>

        <Link
          href="/sell/new"
          className="flex items-center gap-2 whitespace-nowrap rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" /> Sell an item
        </Link>
      </div>
    </header>
  );
}