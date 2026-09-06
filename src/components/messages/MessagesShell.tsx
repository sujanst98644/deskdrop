"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Two-pane inbox: conversation list on the left, open thread on the right.
 *
 * The panes live in a layout rather than a page, so the list stays mounted (and
 * scrolled where you left it) while threads swap underneath. Narrow screens get
 * one pane at a time the way a phone messaging app does — the list at
 * /messages, the thread at /messages/[id] — which is why the split is driven by
 * the path instead of a breakpoint alone.
 */
export function MessagesShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const threadOpen = pathname !== "/messages";

  return (
    <div className="flex h-[calc(100dvh-15rem)] min-h-[30rem] border border-border bg-card">
      <aside
        className={cn(
          "w-full shrink-0 flex-col overflow-y-auto border-border md:flex md:w-80 md:border-r lg:w-96",
          threadOpen ? "hidden" : "flex"
        )}
      >
        {sidebar}
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col md:flex",
          threadOpen ? "flex" : "hidden"
        )}
      >
        {children}
      </section>
    </div>
  );
}
