import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { STATUS, type Status } from "@/lib/status";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { formatRef } from "@/lib/format";
import { MapPinIcon } from "@/components/icons";
import ConfirmButton from "@/components/ConfirmButton";
import { approveDefect, rejectDefect } from "./actions";

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
      "id,ref,description,status,problem_photo_url,fixed_photo_url,gps_lat,gps_lng,created_at,zones(label),contractors(name,trade)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!defect) notFound();

  const { data: events } = await supabase
    .from("defect_events")
    .select("type,actor,note,created_at")
    .eq("defect_id", id)
    .order("created_at");

  const photoMap = await signPhotos(
    [defect.problem_photo_url, defect.fixed_photo_url].filter(Boolean) as string[],
  );

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

        {/* Problem photo */}
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-600">The problem</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoMap[defect.problem_photo_url]}
            alt="Defect"
            className="w-full rounded-2xl object-cover"
          />
        </div>

        {/* Fix photo + approve/reject (appears once the contractor submits) */}
        {defect.fixed_photo_url && (
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-600">
              Contractor’s fix
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoMap[defect.fixed_photo_url]}
              alt="Fix"
              className="w-full rounded-2xl object-cover"
            />
          </div>
        )}

        {defect.status === "fixed_pending" && (
          <div className="flex gap-3">
            <form action={approveDefect} className="flex-1">
              <input type="hidden" name="id" value={defect.id} />
              <button className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white active:bg-green-700">
                Approve
              </button>
            </form>
            <form action={rejectDefect} className="flex-1">
              <input type="hidden" name="id" value={defect.id} />
              <ConfirmButton
                message="Send this back to the contractor as not done? Their link will reopen for another attempt."
                className="w-full rounded-xl bg-white py-3 font-semibold text-red-600 ring-1 ring-red-300 active:bg-red-50"
              >
                Send back
              </ConfirmButton>
            </form>
          </div>
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
