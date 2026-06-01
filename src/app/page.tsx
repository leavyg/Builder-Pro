import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import { STATUS_WEIGHT, type Status } from "@/lib/status";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { formatLocation } from "@/lib/location";
import { PlusIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import RefreshControl from "@/components/RefreshControl";
import DashboardList, { type DefectRow } from "./DashboardList";

export default async function Home() {
  const supabase = await createClient();
  const { data: site } = await supabase.from("sites").select("name").maybeSingle();

  const { data: defects } = await supabase
    .from("defects")
    .select(
      "id,ref,description,status,problem_photo_url,problem_photo_urls,created_at,addresses(label,terraces(name)),contractors(name)",
    );

  const photoMap = await signPhotos(
    (defects ?? []).map((d) => d.problem_photo_url),
  );

  const rows: DefectRow[] = (defects ?? [])
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
      contractor: one<{ name: string }>(d.contractors)?.name,
      photoCount: d.problem_photo_urls?.length ?? 1,
    }));

  return (
    <main className="min-h-dvh bg-slate-50 pb-10 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-slate-500">{site?.name ?? "No site yet"}</p>
        </div>
        <div className="flex items-center gap-1">
          <RefreshControl />
          <LogoutButton />
        </div>
      </header>

      <div className="px-4 py-5">
        <Link
          href="/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition-colors active:bg-blue-700"
        >
          <PlusIcon className="text-xl" />
          New defect
        </Link>
      </div>

      <section className="px-4">
        <DashboardList defects={rows} />
      </section>

      <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-slate-500">
        <Link href="/contractors" className="transition-colors active:text-slate-900">
          Contractors
        </Link>
        <Link href="/terraces" className="transition-colors active:text-slate-900">
          Terraces
        </Link>
      </div>
    </main>
  );
}
