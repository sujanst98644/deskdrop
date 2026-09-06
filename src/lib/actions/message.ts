"use server";

import { prisma } from "@/db";
import { getSession } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { messageSchema } from "@/lib/validations";
import { countUnreadConversations } from "@/lib/messages";
import { getPusherServer } from "@/lib/pusher/server";
import {
  EVENT_INBOX_UPDATE,
  EVENT_NEW_MESSAGE,
  conversationChannel,
  userChannel,
  type NewMessageEvent,
} from "@/lib/pusher/channels";

type Result<T> = { success: true; data: T } | { success: false; error: string };

/**
 * "Your inbox changed" for one user: it carries the new badge count, and tells
 * the conversation sidebar to re-read its previews and ordering.
 *
 * Realtime is best-effort on top of the database write — the message is already
 * committed by the time we fan out, so a Pusher outage must degrade to "the
 * other tab sees it on next navigation", never to a failed send.
 */
async function inboxEvent(userId: string) {
  const unreadCount = await countUnreadConversations(userId);
  return {
    channel: userChannel(userId),
    name: EVENT_INBOX_UPDATE,
    data: { unreadCount },
  };
}

/**
 * Opens (or reopens) the thread for a listing and returns to it. Used directly
 * as a <form action>, so failures bounce back to the listing with ?error=.
 */
export async function startConversationAction(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listingId") ?? "");
  const result = await openConversation(listingId);

  // redirect() throws to unwind, so it has to stay outside the try/catch.
  if (!result.success) {
    redirect(`/listings/${listingId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/messages/${result.data}`);
}

async function openConversation(listingId: string): Promise<Result<string>> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "You must be signed in to send a message" };
    }
    if (!listingId) {
      return { success: false, error: "Listing ID is required" };
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }
    if (listing.sellerId === session.user.id) {
      return { success: false, error: "This is your own listing" };
    }

    // The (listingId, buyerId) unique key makes this idempotent — pressing
    // Message twice returns to the same thread instead of forking it.
    const conversation = await prisma.conversation.upsert({
      where: {
        listingId_buyerId: { listingId: listing.id, buyerId: session.user.id },
      },
      create: {
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
      },
      update: {},
    });

    return { success: true, data: conversation.id };
  } catch (error) {
    console.error("openConversation failed:", error);
    return { success: false, error: "Could not open the conversation" };
  }
}

export async function sendMessageAction(
  conversationId: string,
  body: string
): Promise<Result<NewMessageEvent>> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "You must be signed in" };
    }

    const parsed = messageSchema.safeParse({ body });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid message",
      };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, buyerId: true, sellerId: true },
    });
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }
    if (
      conversation.buyerId !== session.user.id &&
      conversation.sellerId !== session.user.id
    ) {
      return { success: false, error: "You are not part of this conversation" };
    }

    const sentAt = new Date();
    const isBuyer = conversation.buyerId === session.user.id;
    const recipientId = isBuyer ? conversation.sellerId : conversation.buyerId;

    const [created] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          body: parsed.data.body,
          createdAt: sentAt,
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: sentAt,
          lastSenderId: session.user.id,
          // Sending is also reading: your own message must not come back as
          // unread to you, and it lands unread for the other side.
          ...(isBuyer
            ? { buyerLastReadAt: sentAt, buyerUnread: false, sellerUnread: true }
            : { sellerLastReadAt: sentAt, sellerUnread: false, buyerUnread: true }),
        },
      }),
    ]);

    const message: NewMessageEvent = {
      id: created.id,
      body: created.body,
      senderId: created.senderId,
      createdAt: created.createdAt.toISOString(),
    };

    // No revalidatePath: any revalidation in a Server Action makes the client
    // refetch the whole current route, which is exactly the cost we moved off.
    // Both participants learn about this message over their socket instead, and
    // the inbox is force-dynamic so navigating to it re-renders anyway.
    const pusher = getPusherServer();
    if (pusher) {
      try {
        // Both sides get an inbox event: the recipient's badge count moves, and
        // the sender's sidebar has to re-order and show the new preview.
        const inbox = await Promise.all([
          inboxEvent(recipientId),
          inboxEvent(session.user.id),
        ]);
        await pusher.triggerBatch([
          {
            channel: conversationChannel(conversation.id),
            name: EVENT_NEW_MESSAGE,
            data: message,
          },
          ...inbox,
        ]);
      } catch (error) {
        console.error("message fan-out failed:", error);
      }
    }

    return { success: true, data: message };
  } catch (error) {
    console.error("sendMessageAction failed:", error);
    return { success: false, error: "Could not send the message" };
  }
}

export async function markConversationReadAction(
  conversationId: string
): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) return;
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      buyerId: true,
      sellerId: true,
      buyerUnread: true,
      sellerUnread: true,
    },
  });
  if (!conversation) return;

  const isBuyer = conversation.buyerId === userId;
  const isSeller = conversation.sellerId === userId;
  if (!isBuyer && !isSeller) return;

  // The thread calls this on mount and on every message that arrives while it
  // is open, so the already-read case has to cost one indexed read and no
  // write at all.
  if (isBuyer ? !conversation.buyerUnread : !conversation.sellerUnread) return;

  const now = new Date();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: isBuyer
      ? { buyerLastReadAt: now, buyerUnread: false }
      : { sellerLastReadAt: now, sellerUnread: false },
  });

  // Drop the badge in this user's other tabs too.
  const pusher = getPusherServer();
  if (!pusher) return;
  try {
    await pusher.triggerBatch([await inboxEvent(userId)]);
  } catch (error) {
    console.error("read receipt fan-out failed:", error);
  }
}
