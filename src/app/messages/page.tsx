import { MessagesSquare } from "lucide-react";

/**
 * The right-hand pane with nothing open. On narrow screens the shell hides this
 * pane entirely and shows the conversation list instead.
 */
export default function MessagesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <MessagesSquare className="size-8 text-muted-foreground/60" />
      <p className="mt-3 font-medium text-muted-foreground">
        Select a conversation
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a thread on the left, or message a seller from any listing.
      </p>
    </div>
  );
}
