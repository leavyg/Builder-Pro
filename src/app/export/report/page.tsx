import { createClient } from "@/lib/supabase/server";
import { fetchExportDefects, type ExportFilters } from "@/lib/export";
import { signPhotos } from "@/lib/photos";
import { formatRef } from "@/lib/format";
import { formatLocation } from "@/lib/location";
import { STATUS, type Status } from "@/lib/status";
import { one } from "@/lib/rel";
import { APP_NAME } from "@/lib/constants";
import PrintButton from "./PrintButton";

function fmt(ts: string | null) {
  return ts
    ? new Date(ts).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: ExportFilters = {
    from: sp.from,
    to: sp.to,
    status: sp.status,
    contractorId: sp.contractor,
  };

  const supabase = await createClient();
  const rows = await fetchExportDefects(supabase, filters);

  const paths = rows.flatMap((d) =>
    [d.problem_photo_url, d.fixed_photo_urls?.[0]].filter(Boolean),
  ) as string[];
  const photoMap = await signPhotos(paths);

  const statusLabel =
    filters.status && filters.status !== "all"
      ? STATUS[filters.status as Status]?.label
      : "All statuses";
  const range =
    filters.from || filters.to
      ? `${filters.from ?? "start"} → ${filters.to ?? "today"}`
      : "All dates";

  return (
    <main className="mx-auto max-w-3xl bg-white p-6 text-slate-900">
      <style>{`@media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{APP_NAME} — Defect report</h1>
          <p className="text-sm text-slate-500">
            {range} · {statusLabel} · {rows.length} defect
            {rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {rows.map((d) => {
          const s = STATUS[d.status as Status];
          const contractor = one<{ name: string }>(d.contractors)?.name;
          const location = formatLocation(d.addresses);
          const problem = photoMap[d.problem_photo_url];
          const fix = d.fixed_photo_urls?.[0]
            ? photoMap[d.fixed_photo_urls[0]]
            : undefined;
          return (
            <div key={d.id} className="flex gap-4 break-inside-avoid py-4">
              <div className="flex shrink-0 gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {problem && <img src={problem} alt="" className="h-20 w-20 rounded-lg object-cover" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {fix && <img src={fix} alt="" className="h-20 w-20 rounded-lg object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  {formatRef(d.ref)} · {location || "—"}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${s?.badge}`}
                  >
                    {s?.label}
                  </span>
                </p>
                <p className="mt-0.5">{d.description}</p>
                <p className="mt-1 text-slate-500">
                  {contractor} · Raised {fmt(d.created_at)}
                  {d.fixed_at ? ` · Fixed ${fmt(d.fixed_at)}` : ""}
                  {d.approved_at ? ` · Approved ${fmt(d.approved_at)}` : ""}
                </p>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-10 text-center text-slate-400">
            No defects match these filters.
          </p>
        )}
      </div>
    </main>
  );
}
