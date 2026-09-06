"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useInboxUpdates } from "@/lib/pusher/use-inbox-updates";

/**
 * The Messages nav item and its unread badge.
 *
 * Split out of the header because the count is the one piece of it that needs
 * the request's session: keeping it here lets everything around it prerender
 * while this streams in.
 */
export function MessagesNavLink({ initialUnread = 0 }: { initialUnread?: number }) {
  const { data: session } = useSession();

  // Server count first, then the socket keeps it live without re-rendering the
  // page it happens to be sitting on. Whichever arrived last wins: adopting a
  // changed server count during render avoids a second pass showing the stale
  // number.
  const [unread, setUnread] = useState(initialUnread);
  const [serverCount, setServerCount] = useState(initialUnread);
  if (serverCount !== initialUnread) {
    setServerCount(initialUnread);
    setUnread(initialUnread);
  }
  useInboxUpdates(session?.user?.id, (event) => setUnread(event.unreadCount));

  return (
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
  );
}
