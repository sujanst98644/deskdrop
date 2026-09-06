const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-warning text-warning-foreground" },
  ACCEPTED: { label: "Accepted", color: "bg-info text-info-foreground" },
  COMPLETED: { label: "Completed", color: "bg-success text-success-foreground" },
  CANCELLED: { label: "Cancelled", color: "bg-secondary text-secondary-foreground" },
  DECLINED: { label: "Declined", color: "bg-destructive text-destructive-foreground" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const info = statusMap[status] || {
    label: status,
    color: "bg-secondary text-secondary-foreground",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium ${info.color}`}
    >
      {info.label}
    </span>
  );
}
