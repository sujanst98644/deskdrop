"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInboxUpdates } from "@/lib/pusher/use-inbox-updates";

/** Long enough to fold a burst of messages into one refetch, short enough to
 *  still feel immediate. */
const COALESCE_MS = 400;

/**
 * Refreshes the conversation sidebar when a message actually lands, instead of
 * on a timer. Rendering the list needs listing and user rows the event doesn't
 * carry, so this costs one route re-render — but only on a real message, and
 * bursts are coalesced into a single one.
 */
export function InboxRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      router.refresh();
    }, COALESCE_MS);
  }, [router]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useInboxUpdates(userId, scheduleRefresh);
  return null;
}
