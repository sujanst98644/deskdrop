import { prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { formatConversationTime, hasUnread } from "@/lib/messages";
import type { ConversationRole } from "@/components/messages/RoleBadge";
import { MessagesShell } from "@/components/messages/MessagesShell";
import { ConversationSidebar } from "@/components/messages/ConversationSidebar";
import { InboxRealtime } from "@/components/messages/InboxRealtime";

export const dynamic = "force-dynamic";

/**
 * Owns the conversation list for every route under /messages, so navigating
 * between threads swaps only the right-hand pane and the list keeps its scroll
 * position — the reason this is a layout and not a page.
 */
export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      buyerId: true,
      buyerUnread: true,
      sellerUnread: true,
      lastMessageAt: true,
      listing: { select: { images: true } },
      buyer: { select: { name: true } },
      seller: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, senderId: true },
      },
    },
  });

  const items = conversations.map((conversation) => {
    const isBuyer = conversation.buyerId === userId;
    const preview = conversation.messages[0];

    return {
      id: conversation.id,
      otherName: isBuyer ? conversation.seller.name : conversation.buyer.name,
      listingImage: conversation.listing.images?.[0] ?? null,
      role: (isBuyer ? "Buying" : "Selling") as ConversationRole,
      preview: preview?.body ?? null,
      previewIsMine: preview?.senderId === userId,
      timeLabel: formatConversationTime(conversation.lastMessageAt),
      unread: hasUnread(conversation, userId),
    };
  });

  return (
    <div className="container py-6">
      <InboxRealtime userId={userId} />
      <MessagesShell sidebar={<ConversationSidebar conversations={items} />}>
        {children}
      </MessagesShell>
    </div>
  );
}
