import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { STATUS, STATUS_WEIGHT, type Status } from "@/lib/status";
import { formatRef } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";
import FixSnag from "./FixSnag";

// PUBLIC page (no login). Shows ONLY the snags belonging to the contractor whose
// secret token is in the URL.
export default async function ContractorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: contractor } = await admin
    .from("contractors")
    .select("id,name")
    .eq("response_token", token)
    .maybeSingle();
  if (!contractor) notFound();

  const { data: defects } = await admin
    .from("defects")
    .select(
      "id,ref,description,status,problem_photo_url,fixed_photo_url,created_at,zones(label)",
    )
    .eq("contractor_id", contractor.id);

  const photoMap = await signPhotos(
    (defects ?? []).flatMap((d) =>
      [d.problem_photo_url, d.fixed_photo_url].filter(Boolean) as string[],
    ),
  );

  const sorted = (defects ?? []).slice().sort((a, b) => {
    const w =
      STATUS_WEIGHT[a.status as Status] - STATUS_WEIGHT[b.status as Status];
    if (w !== 0) return w;
    return b.created_at.localeCompare(a.created_at);
  });

  const openCount = sorted.filter((d) => d.status === "open").length;

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-slate-50 px-4 py-6 text-slate-900">
      <p className="mb-1 text-sm font-semibold text-slate-400">{APP_NAME}</p>
      <h1 className="mb-1 text-xl font-bold">Hi {contractor.name},</h1>
      <p className="mb-5 text-slate-500">
        {openCount > 0
          ? `You have ${openCount} job${openCount > 1 ? "s" : ""} to look at.`
          : "You're all caught up — nothing outstanding."}
      </p>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="py-10 text-center text-slate-400">No jobs assigned yet.</p>
        )}

        {sorted.map((d) => {
          const s = STATUS[d.status as Status];
          const zone = one<{ label: string }>(d.zones)?.label;
          return (
            <div key={d.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    <span className="text-slate-400">{formatRef(d.ref)}</span>{" "}
                    {d.description}
                  </p>
                  {zone && <p className="text-sm text-slate-500">{zone}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}
                >
                  {s.label}
                </span>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoMap[d.problem_photo_url]}
                alt="The problem"
                className="w-full rounded-xl object-cover"
              />

              {d.status === "open" && (
                <FixSnag contractorToken={token} defectId={d.id} />
              )}

              {d.status === "fixed_pending" && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-800">
                  Sent for approval
                </p>
              )}

              {d.status === "approved" && (
                <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800">
                  Approved — signed off
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
