"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "./client";
import {
  EVENT_INBOX_UPDATE,
  userChannel,
  type InboxUpdateEvent,
} from "./channels";

/**
 * Listens on this user's personal channel.
 *
 * Several components subscribe to it at once (the header badge on every page,
 * the inbox list on /messages), so cleanup only unbinds the handler and leaves
 * the subscription open for the life of the tab — calling unsubscribe here
 * would cut the channel out from under the other listeners. It is one channel
 * on one shared socket either way.
 */
export function useInboxUpdates(
  userId: string | undefined,
  onUpdate: (event: InboxUpdateEvent) => void
) {
  const handler = useRef(onUpdate);
  useEffect(() => {
    handler.current = onUpdate;
  });

  useEffect(() => {
    if (!userId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(userChannel(userId));
    const listener = (event: InboxUpdateEvent) => handler.current(event);
    channel.bind(EVENT_INBOX_UPDATE, listener);

    return () => {
      channel.unbind(EVENT_INBOX_UPDATE, listener);
    };
  }, [userId]);
}
