import type { SupabaseClient } from "@supabase/supabase-js";

export type ExportFilters = {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: string; // open | fixed_pending | approved | all
  contractorId?: string; // id | all
};

export function parseFilters(sp: URLSearchParams): ExportFilters {
  return {
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    status: sp.get("status") || undefined,
    contractorId: sp.get("contractor") || undefined,
  };
}

// Defects matching the filters, scoped to the caller's site via RLS (pass a
// session-bound Supabase client). Used by both the CSV route and PDF report.
export async function fetchExportDefects(
  supabase: SupabaseClient,
  f: ExportFilters,
) {
  let q = supabase
    .from("defects")
    .select(
      "id,ref,status,description,created_at,fixed_at,approved_at,problem_photo_url,problem_photo_urls,fixed_photo_urls,contractors(name),addresses(label,terraces(name))",
    )
    .order("ref");

  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", `${f.to}T23:59:59`);
  if (f.status && f.status !== "all") q = q.eq("status", f.status);
  if (f.contractorId && f.contractorId !== "all")
    q = q.eq("contractor_id", f.contractorId);

  const { data } = await q;
  return data ?? [];
}
