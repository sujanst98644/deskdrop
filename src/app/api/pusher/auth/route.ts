import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { getSession } from "@/lib/auth-guard";
import { getPusherServer } from "@/lib/pusher/server";

/**
 * The only thing standing between a signed-in user and every other user's
 * threads. Pusher will not grant a `private-` channel without a signature from
 * here, so membership is re-checked on every subscribe — never trusted from the
 * channel name the client asked for.
 */
async function canAccess(channel: string, userId: string): Promise<boolean> {
  const userMatch = channel.match(/^private-user-(.+)$/);
  if (userMatch) {
    return userMatch[1] === userId;
  }

  const conversationMatch = channel.match(/^private-conversation-(.+)$/);
  if (conversationMatch) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationMatch[1] },
      select: { buyerId: true, sellerId: true },
    });
    return (
      !!conversation &&
      (conversation.buyerId === userId || conversation.sellerId === userId)
    );
  }

  return false;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: "Realtime is not configured" }, { status: 500 });
  }

  // pusher-js posts these as form fields, not JSON.
  const form = await request.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  if (!(await canAccess(channel, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(pusher.authorizeChannel(socketId, channel));
}
