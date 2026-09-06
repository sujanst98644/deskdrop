"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryDropdown } from "./CategoryDropdown";
import Link from "next/link";
import {
  Search,
  Heart,
  MessageSquare,
  Package,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/lib/form-styles";
import { useInboxUpdates } from "@/lib/pusher/use-inbox-updates";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function Header({
  categories,
  unreadMessages = 0,
}: {
  categories: { id: string; name: string; slug: string }[];
  unreadMessages?: number;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);

  // The badge starts from the server count, then the socket keeps it live
  // without re-rendering whatever page it is sitting on. Whichever arrived last
  // wins: adopting a changed server count during render (rather than in an
  // effect) avoids a second render pass showing the stale number.
  const [unread, setUnread] = useState(unreadMessages);
  const [serverCount, setServerCount] = useState(unreadMessages);
  if (serverCount !== unreadMessages) {
    setServerCount(unreadMessages);
    setUnread(unreadMessages);
  }
  useInboxUpdates(session?.user?.id, (event) => setUnread(event.unreadCount));

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
          <Link
            href="/messages"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> Messages
            {unread > 0 && (
              <span className="bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
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