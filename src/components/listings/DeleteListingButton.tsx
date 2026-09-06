"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListingAction } from "@/lib/actions/listing";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteListingButton({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        // Icon-only and bordered, so it balances the Edit button instead of
        // sitting next to it as a pink block with no outline.
        className="size-9 shrink-0 p-0 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="Delete listing"
        title="Delete listing"
      >
        <Trash2 />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this listing?"
        description={
          listingTitle
            ? `"${listingTitle}" will be removed for good, along with any messages about it.`
            : "The listing will be removed for good, along with any messages about it."
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          const result = await deleteListingAction({ listingId });
          if (!result.success) {
            toast.error(result.error || "Could not delete the listing.");
            // Throwing keeps the dialog open so the error is answerable rather
            // than dismissed along with the prompt.
            throw new Error(result.error || "delete failed");
          }
          toast.success("Listing deleted.");
          router.refresh();
        }}
      />
    </>
  );
}
