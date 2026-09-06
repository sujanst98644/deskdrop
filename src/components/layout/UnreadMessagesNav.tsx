import { getSession } from "@/lib/auth-guard";
import { countUnreadConversations } from "@/lib/messages";
import { MessagesNavLink } from "./MessagesNavLink";

/**
 * Reads the request's session to seed the unread badge. This is the only part
 * of the header that touches runtime data, so it sits behind its own Suspense
 * boundary and the rest of the shell prerenders without it.
 */
export async function UnreadMessagesNav() {
  const session = await getSession();
  const unread = session?.user?.id
    ? await countUnreadConversations(session.user.id)
    : 0;

  return <MessagesNavLink initialUnread={unread} />;
}
