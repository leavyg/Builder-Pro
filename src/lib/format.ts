// Display a defect reference number as #001.
export function formatRef(ref: number | null | undefined): string {
  if (!ref) return "";
  return `#${String(ref).padStart(3, "0")}`;
}
