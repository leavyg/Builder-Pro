import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ConfirmButton from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { addAddress, deleteAddress } from "../actions";

export default async function TerraceAddressesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: terrace } = await supabase
    .from("terraces")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();
  if (!terrace) notFound();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id,label")
    .eq("terrace_id", id)
    .order("label");

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title={terrace.name} back="/terraces" />

      <section className="px-4 py-5">
        <form action={addAddress} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <input type="hidden" name="terrace_id" value={terrace.id} />
          <p className="font-semibold">Add a house to {terrace.name}</p>
          <input
            name="label"
            required
            placeholder="6 Skylark Park Close"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-600"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors active:bg-blue-700"
          >
            Add house
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {addresses?.length ? (
            addresses.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <p className="font-medium">{a.label}</p>
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="terrace_id" value={terrace.id} />
                  <ConfirmButton
                    message={`Remove “${a.label}”?`}
                    className="text-sm font-medium text-red-500 active:text-red-700"
                  >
                    Remove
                  </ConfirmButton>
                </form>
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-slate-400">
              No houses yet — add this terrace’s addresses above.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
