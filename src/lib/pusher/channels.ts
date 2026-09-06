/**
 * Channel names and event payloads, shared by the server trigger and the
 * browser subscriber so the two can never drift apart.
 *
 * Every channel is `private-` prefixed: Pusher refuses to subscribe to one
 * without a signed grant from /api/pusher/auth, which is what stops a logged-in
 * user from listening to someone else's thread.
 */

export const conversationChannel = (conversationId: string) =>
  `private-conversation-${conversationId}`;

export const userChannel = (userId: string) => `private-user-${userId}`;

export const EVENT_NEW_MESSAGE = "new-message";
export const EVENT_INBOX_UPDATE = "inbox-update";

export type NewMessageEvent = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export type InboxUpdateEvent = {
  unreadCount: number;
};
