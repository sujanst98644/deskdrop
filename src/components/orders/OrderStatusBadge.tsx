const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  ACCEPTED: { label: "Accepted", color: "bg-blue-500" },
  COMPLETED: { label: "Completed", color: "bg-green-500" },
  CANCELLED: { label: "Cancelled", color: "bg-neutral-500" },
  DECLINED: { label: "Declined", color: "bg-red-500" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const info = statusMap[status] || { label: status, color: "bg-gray-500" };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium text-white rounded ${info.color}`}>
      {info.label}
    </span>
  );
}