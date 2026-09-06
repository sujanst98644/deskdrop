"use client";

import PusherClient from "pusher-js";

/**
 * One socket for the whole tab. Pusher bills per concurrent connection, so
 * every subscriber shares this instance and only the channel is per-component.
 */
let cached: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (cached) return cached;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;

  cached = new PusherClient(key, {
    cluster,
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
  });
  return cached;
}
