import AppHeader from "@/components/AppHeader";
import ConfirmButton from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { addZone, deleteZone } from "./actions";

export default async function ZonesPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("zones")
    .select("id,label")
    .order("label");

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Zones" />

      <section className="px-4 py-5">
        <form action={addZone} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold">Add a zone</p>
          <p className="text-sm text-slate-500">
            A location your dad taps when raising a defect — e.g. “Block A / Floor 2
            / Unit 14”.
          </p>
          <input
            name="label"
            required
            placeholder="Block A / Floor 2 / Unit 14"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-600"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors active:bg-blue-700"
          >
            Add zone
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {zones?.length ? (
            zones.map((z) => (
              <li
                key={z.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <p className="font-medium">{z.label}</p>
                <form action={deleteZone}>
                  <input type="hidden" name="id" value={z.id} />
                  <ConfirmButton
                    message={`Remove “${z.label}”?`}
                    className="text-sm font-medium text-red-500 active:text-red-700"
                  >
                    Remove
                  </ConfirmButton>
                </form>
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-slate-400">
              No zones yet — add your site’s areas above.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
