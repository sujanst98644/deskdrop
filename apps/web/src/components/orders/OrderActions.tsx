"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";

export function OrderActions({ order, role }: { order: any; role: "buyer" | "seller" }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId: order.id, status });
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error);
      }
    });
  };

  const canCancel = role === "buyer" && order.status === "PENDING";
  const canAccept = role === "seller" && order.status === "PENDING";
  const canComplete = role === "seller" && order.status === "ACCEPTED";

  return (
    <div className="flex gap-2">
      {canAccept && (
        <Button size="sm" onClick={() => handleAction("ACCEPTED")} disabled={isPending}>
          Accept
        </Button>
      )}
      {canComplete && (
        <Button size="sm" variant="default" onClick={() => handleAction("COMPLETED")} disabled={isPending}>
          Complete
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="destructive" onClick={() => handleAction("CANCELLED")} disabled={isPending}>
          Cancel
        </Button>
      )}
    </div>
  );
}