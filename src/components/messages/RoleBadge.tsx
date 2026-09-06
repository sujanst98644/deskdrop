import { cn } from "@/lib/utils";

export type ConversationRole = "Buying" | "Selling";

/**
 * Which side of the trade you are on in this thread. Colour-coded because the
 * inbox mixes both, and "am I the buyer here?" is the first thing you need to
 * know before reading the message — follows the soft-badge pattern used for
 * listing status elsewhere.
 */
const roleStyles: Record<ConversationRole, string> = {
  Buying: "border-info/40 bg-info/10 text-info",
  Selling: "border-success/40 bg-success/10 text-success",
};

export function RoleBadge({
  role,
  className,
}: {
  role: ConversationRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide",
        roleStyles[role],
        className
      )}
    >
      {role}
    </span>
  );
}
