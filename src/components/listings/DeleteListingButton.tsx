"use client";

import { useTransition } from "react";
import { deleteListingAction } from "@/lib/actions/listing";
import { Button } from "@/components/ui/button";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    startTransition(async () => {
      const result = await deleteListingAction({ listingId });
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Something went wrong");
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      className="flex-1"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}