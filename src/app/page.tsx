import { createClient } from "@/lib/supabase/server";
import { STATUS_WEIGHT, type Status } from "@/lib/status";
import { signPhotos } from "@/lib/photos";
import { one } from "@/lib/rel";
import { formatLocation } from "@/lib/location";
import Logo from "@/components/Logo";
import RefreshControl from "@/components/RefreshControl";
import BottomTabBar from "@/components/BottomTabBar";
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
    <main className="min-h-dvh bg-slate-50 pb-24 text-slate-900">
      <header className="flex items-center justify-between bg-navy px-5 py-4 text-white">
        <div>
          <Logo className="text-lg" />
          <p className="mt-0.5 text-sm text-slate-300">
            {site?.name ?? "No site yet"}
          </p>
        </div>
        <RefreshControl />
      </header>

      <section className="px-4 pt-4">
        <DashboardList defects={rows} />
      </section>

      <BottomTabBar />
    </main>
  );
}
