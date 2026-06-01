import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { updateContractor } from "../../actions";

export default async function EditContractorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("contractors")
    .select("id,name,trade,phone,email")
    .eq("id", id)
    .maybeSingle();

  if (!c) notFound();

  const input =
    "w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-navy";

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Edit contractor" back="/contractors" />
      <section className="px-4 py-5">
        <form action={updateContractor} className="space-y-3">
          <input type="hidden" name="id" value={c.id} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input name="name" required defaultValue={c.name ?? ""} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Trade
            </label>
            <input
              name="trade"
              defaultValue={c.trade ?? ""}
              placeholder="e.g. Electrician"
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={c.phone ?? ""}
              placeholder="For SMS / WhatsApp"
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue={c.email ?? ""}
              placeholder="For email notifications"
              className={input}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white transition-colors active:bg-navy-light"
          >
            Save changes
          </button>
        </form>
      </section>
    </main>
  );
}
