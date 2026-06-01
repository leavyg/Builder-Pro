import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { signPhotos } from "@/lib/photos";
import { formatLocation } from "@/lib/location";
import { STATUS_WEIGHT, type Status } from "@/lib/status";
import { APP_NAME } from "@/lib/constants";
import RefreshControl from "@/components/RefreshControl";
import ContractorList, { type SnagRow } from "./ContractorList";

// PUBLIC page (no login). Shows ONLY the snags belonging to the contractor whose
// secret token is in the URL — now a compact list like the manager's dashboard.
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
      "id,ref,description,status,problem_photo_url,problem_photo_urls,created_at,addresses(label,terraces(name))",
    )
    .eq("contractor_id", contractor.id);

  const photoMap = await signPhotos(
    (defects ?? []).map((d) => d.problem_photo_url),
  );

  const rows: SnagRow[] = (defects ?? [])
    .slice()
    .sort((a, b) => {
      const w =
        STATUS_WEIGHT[a.status as Status] - STATUS_WEIGHT[b.status as Status];
      if (w !== 0) return w;
      return b.created_at.localeCompare(a.created_at);
    })
    .map((d) => ({
      id: d.id,
      ref: d.ref,
      description: d.description,
      status: d.status as Status,
      thumb: photoMap[d.problem_photo_url],
      zone: formatLocation(d.addresses) || undefined,
      photoCount: d.problem_photo_urls?.length ?? 1,
      created: d.created_at,
    }));

  const todo = rows.filter((r) => r.status === "open").length;

  return (
    <main className="min-h-dvh bg-slate-50 pb-10 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {APP_NAME}
          </p>
          <h1 className="text-lg font-bold tracking-tight">{contractor.name}</h1>
          <p className="text-sm text-slate-500">
            {todo > 0
              ? `${todo} job${todo > 1 ? "s" : ""} to do`
              : "Nothing outstanding"}
          </p>
        </div>
        <RefreshControl />
      </header>

      <section className="px-4 pt-4">
        <ContractorList rows={rows} token={token} />
      </section>
    </main>
  );
}
