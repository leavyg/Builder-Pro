import { createClient } from "@/lib/supabase/server";
import { fetchExportDefects, parseFilters } from "@/lib/export";
import { formatRef } from "@/lib/format";
import { STATUS, type Status } from "@/lib/status";
import { one } from "@/lib/rel";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function fmtDate(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString("en-IE") : "";
}

// CSV of defects (filtered). Manager session → RLS scopes to their site.
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const filters = parseFilters(new URL(req.url).searchParams);
  const rows = await fetchExportDefects(supabase, filters);

  const header = [
    "Ref",
    "Status",
    "Terrace",
    "House",
    "Contractor",
    "Description",
    "Raised",
    "Fixed",
    "Approved",
    "Problem photos",
    "Fix photos",
  ];

  const lines = [header.map(cell).join(",")];
  for (const d of rows) {
    const addr = one<{
      label: string;
      terraces: { name: string } | { name: string }[] | null;
    }>(d.addresses);
    const terrace = one<{ name: string }>(addr?.terraces ?? null);
    const contractor = one<{ name: string }>(d.contractors);
    lines.push(
      [
        formatRef(d.ref),
        STATUS[d.status as Status]?.label ?? d.status,
        terrace?.name ?? "",
        addr?.label ?? "",
        contractor?.name ?? "",
        d.description,
        fmtDate(d.created_at),
        fmtDate(d.fixed_at),
        fmtDate(d.approved_at),
        d.problem_photo_urls?.length ?? (d.problem_photo_url ? 1 : 0),
        d.fixed_photo_urls?.length ?? 0,
      ]
        .map(cell)
        .join(","),
    );
  }

  const csv = "﻿" + lines.join("\r\n"); // BOM so Excel reads UTF-8
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="builder-pro-defects-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
