import { prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ImageOff } from "lucide-react";
import { formatRs } from "@/lib/utils";
import { MessageThread } from "@/components/messages/MessageThread";
import { RoleBadge } from "@/components/messages/RoleBadge";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      listing: {
        select: { id: true, title: true, pricePaisa: true, images: true },
      },
      buyer: { select: { name: true } },
      seller: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, senderId: true, createdAt: true },
      },
    },
  });

  // A stranger asking for someone else's thread gets a 404, not a 403 — no
  // reason to confirm the conversation exists.
  if (
    !conversation ||
    (conversation.buyerId !== userId && conversation.sellerId !== userId)
  ) {
    notFound();
  }

  const isBuyer = conversation.buyerId === userId;
  const other = isBuyer ? conversation.seller : conversation.buyer;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border p-4">
        {/* The list is a sibling pane on desktop, a separate screen on mobile. */}
        <Link
          href="/messages"
          aria-label="All messages"
          className="-ml-1 shrink-0 text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          <ChevronLeft className="size-5" />
        </Link>

        <div className="relative size-11 shrink-0 overflow-hidden bg-muted">
          {conversation.listing.images?.[0] ? (
            <Image
              src={conversation.listing.images[0]}
              alt=""
              fill
              sizes="44px"
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
          <p className="truncate font-medium">{other.name}</p>
          <Link
            href={`/listings/${conversation.listing.id}`}
            className="truncate text-sm text-muted-foreground hover:underline"
          >
            {conversation.listing.title} ·{" "}
            {formatRs(conversation.listing.pricePaisa)}
          </Link>
        </div>

        <RoleBadge
          role={isBuyer ? "Buying" : "Selling"}
          className="px-2 py-1 text-[11px]"
        />
      </div>

      <MessageThread
        conversationId={conversation.id}
        currentUserId={userId}
        messages={conversation.messages.map((message) => ({
          id: message.id,
          body: message.body,
          senderId: message.senderId,
          createdAt: message.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
