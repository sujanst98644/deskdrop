"use client";

import { useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The app's confirmation prompt, replacing window.confirm().
 *
 * Built on the alert-dialog primitive rather than plain dialog: it traps focus,
 * announces itself as an alert, and cannot be dismissed by clicking away — a
 * destructive action should take a deliberate answer, not a stray click.
 *
 * Controlled by design. The caller owns `open`, so the same dialog can be
 * driven from a menu item, an icon button, or a keyboard shortcut.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Leave the dialog open so the caller's toast lands somewhere visible.
      console.error("confirm action failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog.Root
      open={open}
      // Escape must not abandon an action that is already in flight.
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-border bg-popover p-5 text-popover-foreground shadow-xl transition duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
          <AlertDialog.Title className="text-base font-semibold">
            {title}
          </AlertDialog.Title>

          {description && (
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </AlertDialog.Description>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close
              disabled={isPending}
              render={<Button variant="outline" size="lg" />}
            >
              {cancelLabel}
            </AlertDialog.Close>
            <Button
              size="lg"
              variant={variant}
              // The destructive *variant* is a soft tint, right for an icon
              // button sitting in a row but far too quiet for the primary
              // action of a dialog. Solid it up so the confirm reads as the
              // button you came here to press.
              className={
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
