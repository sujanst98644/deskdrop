import type { LucideIcon } from "lucide-react";

/**
 * The one empty state in the app — a centred icon over a light-grey message,
 * so "nothing here yet" reads the same on every page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground/60" />
      <p className="mt-3 font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
