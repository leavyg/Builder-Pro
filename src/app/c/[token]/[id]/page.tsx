import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { STATUS, type Status } from "@/lib/status";
import { formatRef } from "@/lib/format";
import { ChevronLeftIcon } from "@/components/icons";
import FixSnag from "../FixSnag";

const EVENT_LABEL: Record<string, string> = {
  created: "Job raised",
  fixed_submitted: "You submitted a fix",
  approved: "Approved by site manager",
  rejected: "Sent back",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-IE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ContractorSnagPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = await params;
  const admin = createAdminClient();

  const { data: contractor } = await admin
    .from("contractors")
    .select("id")
    .eq("response_token", token)
    .maybeSingle();
  if (!contractor) notFound();

  const { data: defect } = await admin
    .from("defects")
    .select(
      "id,ref,description,status,contractor_id,problem_photo_url,fixed_photo_url,zones(label)",
    )
    .eq("id", id)
    .maybeSingle();
  // Ownership check: this snag must belong to the contractor in the link.
  if (!defect || defect.contractor_id !== contractor.id) notFound();

  const { data: events } = await admin
    .from("defect_events")
    .select("type,actor,note,created_at")
    .eq("defect_id", id)
    .order("created_at");

  const photoMap = await signPhotos(
    [defect.problem_photo_url, defect.fixed_photo_url].filter(Boolean) as string[],
  );
  const s = STATUS[defect.status as Status];
  const zone = one<{ label: string }>(defect.zones)?.label;

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Link
          href={`/c/${token}`}
          aria-label="Back"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
        >
          <ChevronLeftIcon className="text-xl" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Job</h1>
      </header>

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
        {zone && <p className="text-sm text-slate-500">Location: {zone}</p>}

        <div>
          <p className="mb-1 text-sm font-semibold text-slate-600">The problem</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoMap[defect.problem_photo_url]}
            alt="The problem"
            className="w-full rounded-2xl object-cover"
          />
        </div>

        {defect.status === "open" && (
          <div>
            <p className="mb-2 font-semibold">Mark it fixed</p>
            <FixSnag contractorToken={token} defectId={defect.id} />
          </div>
        )}

        {defect.fixed_photo_url && (
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-600">
              Your submitted fix
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoMap[defect.fixed_photo_url]}
              alt="Your fix"
              className="w-full rounded-2xl object-cover"
            />
          </div>
        )}

        {defect.status === "fixed_pending" && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-800">
            Sent for approval — waiting on the site manager.
          </p>
        )}
        {defect.status === "approved" && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800">
            Approved — signed off.
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-600">History</p>
          <ul className="space-y-2">
            {events?.map((e, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-700">
                  {EVENT_LABEL[e.type] ?? e.type}
                  {e.note ? ` — ${e.note}` : ""}
                </span>
                <span className="shrink-0 text-slate-400">{fmt(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
