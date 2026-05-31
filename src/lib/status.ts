// Single source of truth for the defect status colours + labels.
export const STATUS = {
  open: {
    label: "Open",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
  fixed_pending: {
    label: "Awaiting approval",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Approved",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
} as const;

export type Status = keyof typeof STATUS;

// For sorting: items needing action first (your approval, then contractor's fix),
// resolved last.
export const STATUS_WEIGHT: Record<Status, number> = {
  fixed_pending: 0,
  open: 1,
  approved: 2,
};
