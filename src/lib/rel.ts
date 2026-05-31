// Supabase types a to-one embedded relation as an array when there are no
// generated DB types. At runtime it's a single object (or null), so normalise it.
export function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}
