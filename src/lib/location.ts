import { one } from "@/lib/rel";

// The shape returned by a Supabase `addresses(label, terraces(name))` join
// (relations may arrive as objects or single-element arrays).
type AddrJoin = {
  label: string;
  terraces: { name: string } | { name: string }[] | null;
};

// Formats a defect's location as "T41 · 6 Skylark Park Close" (or just the
// address / terrace if one is missing). Returns "" when there's no address.
export function formatLocation(
  addr: AddrJoin | AddrJoin[] | null | undefined,
): string {
  const a = one<AddrJoin>(addr ?? null);
  if (!a) return "";
  const t = one<{ name: string }>(a.terraces ?? null);
  return t ? `${t.name} · ${a.label}` : a.label;
}
