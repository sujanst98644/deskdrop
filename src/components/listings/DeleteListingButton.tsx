"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListingAction } from "@/lib/actions/listing";
import { Button } from "@/components/ui/button";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete this listing? This can't be undone.")) return;

    startTransition(async () => {
      const result = await deleteListingAction({ listingId });
      if (result.success) {
        toast.success("Listing deleted.");
        router.refresh();
      } else {
        toast.error(result.error || "Could not delete the listing.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      // Icon-only and bordered, so it balances the Edit button instead of
      // sitting next to it as a pink block with no outline.
      className="size-9 shrink-0 p-0 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete listing"
      title="Delete listing"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
