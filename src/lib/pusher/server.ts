import Pusher from "pusher";

/**
 * Returns null when Pusher is not configured so the app still runs without
 * credentials — sends succeed and persist, they just don't fan out live. Every
 * caller treats realtime as best-effort on top of the database write.
 */
let cached: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (cached) return cached;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  cached = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return cached;
}
