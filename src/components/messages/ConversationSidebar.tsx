"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ImageOff, MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleBadge, type ConversationRole } from "@/components/messages/RoleBadge";
import { cn } from "@/lib/utils";

export type SidebarConversation = {
  id: string;
  otherName: string;
  listingImage: string | null;
  role: ConversationRole;
  preview: string | null;
  previewIsMine: boolean;
  timeLabel: string;
  unread: boolean;
};

export function ConversationSidebar({
  conversations,
}: {
  conversations: SidebarConversation[];
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold">Messages</h1>
        <p className="text-xs text-muted-foreground">
          {conversations.length} conversation
          {conversations.length === 1 ? "" : "s"}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={MessagesSquare}
            title="No conversations yet"
            description="Message a seller from any listing and the thread shows up here."
          />
        </div>
      ) : (
        <ul>
          {conversations.map((conversation) => {
            const isActive = pathname === `/messages/${conversation.id}`;
            // Opening a thread reads it; don't wait for the server round trip
            // to drop the bold out from under the tap.
            const unread = conversation.unread && !isActive;

            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 border-b border-border p-3 transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden bg-muted">
                    {conversation.listingImage ? (
                      <Image
                        src={conversation.listingImage}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "min-w-0 truncate text-sm",
                          unread ? "font-semibold" : "font-medium"
                        )}
                      >
                        {conversation.otherName}
                      </span>
                      <RoleBadge role={conversation.role} />
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                        {conversation.timeLabel}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2">
                      <p
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          unread
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversation.preview
                          ? `${conversation.previewIsMine ? "You: " : ""}${conversation.preview}`
                          : "No messages yet"}
                      </p>
                      {unread && (
                        <span
                          aria-label="Unread"
                          className="size-2 shrink-0 bg-primary"
                        />
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
