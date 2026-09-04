"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@prisma/client";

export function OrderActions({
  order,
  role,
}: {
  order: { id: string; status: OrderStatus };
  role: "buyer" | "seller";
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: "ACCEPTED" | "COMPLETED" | "CANCELLED") => {
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