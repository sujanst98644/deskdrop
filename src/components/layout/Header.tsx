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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/lib/form-styles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function Header({
  categories,
  messagesNav,
}: {
  categories: { id: string; name: string; slug: string }[];
  messagesNav: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  return (
    <header className="bg-background border-b border-border">
      {/* ================= Desktop / tablet (md and up) — unchanged from before ================= */}
      <div className="hidden md:block">
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
            {messagesNav}
            {isPending ? null : session ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4" /> {session.user?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSignOutOpen(true)}
                  aria-label="Sign out"
                  title="Sign out"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
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
      </div>

      {/* ================= Mobile (below md) — new ================= */}
      <div className="md:hidden">
        <div className="container flex h-14 items-center justify-between gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Desk<span className="text-primary">drop</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/sell/new"
              aria-label="Sell an item"
              className="flex h-9 w-9 items-center justify-center bg-foreground text-background"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center border border-border text-foreground"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="container pb-3">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="search"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(fieldClass, "h-10 flex-1 border-r-0 px-3 py-0 text-sm")}
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {menuOpen && (
          <div className="container border-t border-border pb-4 pt-3">
            <div className="mb-3">
              <CategoryDropdown categories={categories} />
            </div>

            <nav className="flex flex-col gap-1 text-sm">
              <Link
                href="/dashboard/listings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-4 w-4" /> My Listings
              </Link>
              <Link
                href="/dashboard/orders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground"
              >
                <Package className="h-4 w-4" /> My Orders
              </Link>
              <div onClick={() => setMenuOpen(false)}>{messagesNav}</div>

              <div className="mt-2 border-t border-border pt-2">
                {isPending ? null : session ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" /> {session.user?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSignOutOpen(true);
                      }}
                      aria-label="Sign out"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <User className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need to sign in again to message sellers or manage your listings."
        confirmLabel="Sign out"
        variant="destructive"
        onConfirm={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
      />
    </header>
  );
}