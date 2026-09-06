import { prisma } from "@/db";

/** The read state a page needs to decide whether a thread is bold. */
export type UnreadShape = {
  buyerId: string;
  buyerUnread: boolean;
  sellerUnread: boolean;
};

export function hasUnread(conversation: UnreadShape, userId: string) {
  return conversation.buyerId === userId
    ? conversation.buyerUnread
    : conversation.sellerUnread;
}

/**
 * Runs in the root layout on every page, so it has to stay a single COUNT that
 * an index can answer — never a findMany filtered in JS, which grows with the
 * user's conversation list on every navigation.
 */
export async function countUnreadConversations(userId: string) {
  return prisma.conversation.count({
    where: {
      OR: [
        { buyerId: userId, buyerUnread: true },
        { sellerId: userId, sellerUnread: true },
      ],
    },
  });
}

/**
 * WhatsApp-style recency label for the inbox: time today, "Yesterday", weekday
 * within the week, then a date. Formatted on the server so the sidebar — a
 * client component — has no relative-time hydration mismatch to worry about.
 */
export function formatConversationTime(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (date >= startOfToday) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  if (date >= startOfYesterday) return "Yesterday";

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6);
  if (date >= startOfWeek) {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  }

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
