import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ConfirmButton from "@/components/ConfirmButton";
import LocationPicker from "@/components/LocationPicker";
import { createClient } from "@/lib/supabase/server";
import { updateDefect, deleteDefect } from "../actions";

export default async function EditDefectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: defect } = await supabase
    .from("defects")
    .select("id,description,contractor_id,address_id")
    .eq("id", id)
    .maybeSingle();
  if (!defect) notFound();

  const [{ data: contractors }, { data: terraces }] = await Promise.all([
    supabase.from("contractors").select("id,name,trade").order("name"),
    supabase.from("terraces").select("id,name,addresses(id,label)").order("name"),
  ]);

  const input =
    "w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-navy";

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Edit defect" back={`/defect/${id}`} />
      <section className="space-y-6 px-4 py-5">
        <form action={updateDefect} className="space-y-4">
          <input type="hidden" name="id" value={defect.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              What’s wrong?
            </label>
            <textarea
              name="description"
              required
              rows={2}
              defaultValue={defect.description}
              className={input}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assigned to
            </label>
            <select
              name="contractor_id"
              defaultValue={defect.contractor_id}
              className={input}
            >
              {contractors?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.trade ? ` · ${c.trade}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Changing this notifies the new contractor.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Location
            </label>
            <LocationPicker
              terraces={terraces ?? []}
              initialAddressId={defect.address_id ?? undefined}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white transition-colors active:bg-navy-light"
          >
            Save changes
          </button>
        </form>

        <form action={deleteDefect}>
          <input type="hidden" name="id" value={defect.id} />
          <ConfirmButton
            message="Delete this defect permanently? This can't be undone."
            className="w-full rounded-xl bg-white py-3 font-semibold text-red-600 ring-1 ring-red-300 transition-colors active:bg-red-50"
          >
            Delete defect
          </ConfirmButton>
        </form>
      </section>
    </main>
  );
}
