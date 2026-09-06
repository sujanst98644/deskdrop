"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  markConversationReadAction,
  sendMessageAction,
} from "@/lib/actions/message";
import { getPusherClient } from "@/lib/pusher/client";
import {
  EVENT_NEW_MESSAGE,
  conversationChannel,
  type NewMessageEvent,
} from "@/lib/pusher/channels";

export type ThreadMessage = NewMessageEvent;

type PendingMessage = ThreadMessage & { pending: true };

/** Ascending by time, id as a stable tie-break for same-millisecond sends. */
function byCreatedAt(a: ThreadMessage, b: ThreadMessage) {
  return a.createdAt === b.createdAt
    ? a.id.localeCompare(b.id)
    : a.createdAt.localeCompare(b.createdAt);
}

// Built once rather than per bubble — toLocaleTimeString rebuilds a formatter
// on every call, and a long thread calls it for every message on every render.
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

/** Consecutive messages from one sender inside this window read as one turn. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function dayLabel(date: Date) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (date >= startOfToday) return "Today";

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  if (date >= startOfYesterday) return "Yesterday";

  return dateFormat.format(date);
}

export function MessageThread({
  conversationId,
  currentUserId,
  messages: initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  messages: ThreadMessage[];
}) {
  const [isSending, startSending] = useTransition();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Switching threads replaces the list; a re-render of the same thread merges
  // instead, so anything the socket delivered after the server rendered isn't
  // thrown away by a payload that predates it.
  const loadedFor = useRef(conversationId);
  useEffect(() => {
    if (loadedFor.current !== conversationId) {
      loadedFor.current = conversationId;
      setMessages(initialMessages);
      setPending([]);
      return;
    }
    setMessages((current) => {
      const seen = new Set(current.map((m) => m.id));
      const added = initialMessages.filter((m) => !seen.has(m.id));
      return added.length ? [...current, ...added].sort(byCreatedAt) : current;
    });
  }, [conversationId, initialMessages]);

  /** Idempotent: the socket and the send response both deliver the same row. */
  const addMessage = useCallback((message: ThreadMessage) => {
    setMessages((current) =>
      current.some((m) => m.id === message.id)
        ? current
        : [...current, message].sort(byCreatedAt)
    );
  }, []);

  // Live thread. The server re-checks membership before Pusher will hand out
  // this channel, so subscribing is not itself an authorisation.
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const name = conversationChannel(conversationId);
    const channel = pusher.subscribe(name);
    channel.bind(EVENT_NEW_MESSAGE, addMessage);

    return () => {
      channel.unbind(EVENT_NEW_MESSAGE, addMessage);
      pusher.unsubscribe(name);
    };
  }, [conversationId, addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending.length]);

  // Reading requires actually looking at the thread — a background tab holding
  // the page open must not clear the other side's unread badge. The action
  // no-ops server-side when the thread is already read, so re-firing is cheap.
  useEffect(() => {
    const markRead = () => {
      if (document.visibilityState !== "visible") return;
      void markConversationReadAction(conversationId);
    };

    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [conversationId, messages.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;

    const draftId = `pending-${Date.now()}-${Math.random()}`;
    setDraft("");
    setPending((current) => [
      ...current,
      {
        id: draftId,
        body,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);

    startSending(async () => {
      const result = await sendMessageAction(conversationId, body);
      setPending((current) => current.filter((m) => m.id !== draftId));

      if (!result.success) {
        toast.error(result.error);
        setDraft((current) => current || body);
        return;
      }

      // Don't wait on our own broadcast to come back around.
      addMessage(result.data);
    });
  };

  const visible: (ThreadMessage & { pending?: boolean })[] = [
    ...messages,
    ...pending,
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
        {/* min-h-full + justify-end keeps a short thread sitting on the
            composer instead of stranded at the top of an empty panel. */}
        <div
          className={cn(
            "flex min-h-full flex-col",
            visible.length === 0 ? "justify-center" : "justify-end"
          )}
        >
          {visible.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet — say hello.
            </p>
          ) : (
            visible.map((message, index) => {
              const previous = visible[index - 1];
              const sentAt = new Date(message.createdAt);
              const isMine = message.senderId === currentUserId;

              const startsDay =
                !previous ||
                new Date(previous.createdAt).toDateString() !==
                  sentAt.toDateString();
              const grouped =
                !startsDay &&
                previous.senderId === message.senderId &&
                sentAt.getTime() - new Date(previous.createdAt).getTime() <
                  GROUP_WINDOW_MS;

              return (
                <Fragment key={message.id}>
                  {startsDay && (
                    <div className="my-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-border" />
                      <span
                        suppressHydrationWarning
                        className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {dayLabel(sentAt)}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start",
                      grouped ? "mt-0.5" : "mt-3 first:mt-0"
                    )}
                  >
                    {/* Time sits on the last line of text rather than under it,
                        so a one-word message stays one line tall. */}
                    <div
                      className={cn(
                        "flex max-w-[75%] items-end gap-2 px-3 py-1.5",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card",
                        message.pending && "opacity-60"
                      )}
                    >
                      <p className="min-w-0 whitespace-pre-wrap break-words text-sm">
                        {message.body}
                      </p>
                      <time
                        suppressHydrationWarning
                        dateTime={message.createdAt}
                        className={cn(
                          "shrink-0 translate-y-px text-[10px] tabular-nums",
                          isMine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {timeFormat.format(sentAt)}
                      </time>
                    </div>
                  </div>
                </Fragment>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-4"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          maxLength={2000}
          aria-label="Message"
          className="h-10 flex-1 border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <Button
          type="submit"
          className="h-10"
          disabled={isSending || draft.trim().length === 0}
        >
          <Send />
          Send
        </Button>
      </form>
    </div>
  );
}
