/**
 * Display names for the Prisma enums. Kept in one place because the raw values
 * (`LIKE_NEW`, `AVAILABLE`) were leaking into the UI wherever a page forgot to
 * map them.
 */
export const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

export const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  SOLD: "Sold",
};

export function conditionLabel(condition: string) {
  return conditionLabels[condition] ?? condition;
}

export function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}
