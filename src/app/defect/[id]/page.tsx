import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { STATUS, type Status } from "@/lib/status";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { formatRef } from "@/lib/format";
import { MapPinIcon } from "@/components/icons";
import PhotoGrid from "@/components/PhotoGrid";
import ReviewActions from "./ReviewActions";

const EVENT_LABEL: Record<string, string> = {
  created: "Defect raised",
  fixed_submitted: "Fix submitted by contractor",
  approved: "Approved",
  rejected: "Sent back to contractor",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-IE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DefectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: defect } = await supabase
    .from("defects")
    .select(
      "id,ref,description,status,problem_photo_url,problem_photo_urls,fixed_photo_url,fixed_photo_urls,gps_lat,gps_lng,created_at,zones(label),contractors(name,trade)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!defect) notFound();

  const { data: events } = await supabase
    .from("defect_events")
    .select("type,actor,note,created_at")
    .eq("defect_id", id)
    .order("created_at");

  const problemPaths = (
    defect.problem_photo_urls?.length
      ? defect.problem_photo_urls
      : [defect.problem_photo_url]
  ).filter(Boolean) as string[];
  const fixPaths = (
    defect.fixed_photo_urls?.length
      ? defect.fixed_photo_urls
      : defect.fixed_photo_url
        ? [defect.fixed_photo_url]
        : []
  ).filter(Boolean) as string[];

  const photoMap = await signPhotos([...problemPaths, ...fixPaths]);
  const problemUrls = problemPaths.map((p) => photoMap[p]).filter(Boolean);
  const fixUrls = fixPaths.map((p) => photoMap[p]).filter(Boolean);

  const s = STATUS[defect.status as Status];
  const contractor = one<{ name: string; trade: string | null }>(defect.contractors);
  const zone = one<{ label: string }>(defect.zones)?.label;

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Defect" />

      <section className="space-y-5 px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-400">
            {formatRef(defect.ref)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${s.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>

        <p className="text-lg font-medium">{defect.description}</p>

        <div className="text-sm text-slate-500">
          <p>
            Assigned to{" "}
            <span className="font-medium text-slate-700">{contractor?.name}</span>
            {contractor?.trade ? ` (${contractor.trade})` : ""}
          </p>
          {zone && <p>Location: {zone}</p>}
          {defect.gps_lat && defect.gps_lng && (
            <a
              className="inline-flex items-center gap-1 font-medium text-blue-600"
              href={`https://maps.google.com/?q=${defect.gps_lat},${defect.gps_lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPinIcon className="text-sm" />
              View on map
            </a>
          )}
          <p>Raised {fmt(defect.created_at)}</p>
        </div>

        {/* Problem photos */}
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-600">
            The problem{problemUrls.length > 1 ? ` (${problemUrls.length})` : ""}
          </p>
          <PhotoGrid urls={problemUrls} />
        </div>

        {/* Fix photos + approve/reject (appears once the contractor submits) */}
        {fixUrls.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-600">
              Contractor’s fix{fixUrls.length > 1 ? ` (${fixUrls.length})` : ""}
            </p>
            <PhotoGrid urls={fixUrls} />
          </div>
        )}

        {defect.status === "fixed_pending" && (
          <ReviewActions defectId={defect.id} />
        )}

        {/* Audit trail */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-600">History</p>
          <ul className="space-y-2">
            {events?.map((e, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">
                  {EVENT_LABEL[e.type] ?? e.type}
                  {e.note ? ` — ${e.note}` : ""}
                </span>
                <span className="text-slate-400">{fmt(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
