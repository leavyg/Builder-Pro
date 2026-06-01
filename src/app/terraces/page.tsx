import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import ConfirmButton from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { ChevronRightIcon } from "@/components/icons";
import { addTerrace, deleteTerrace } from "./actions";

export default async function TerracesPage() {
  const supabase = await createClient();
  const { data: terraces } = await supabase
    .from("terraces")
    .select("id,name,addresses(count)")
    .order("name");

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Terraces" />

      <section className="px-4 py-5">
        <form action={addTerrace} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold">Add a terrace</p>
          <p className="text-sm text-slate-500">
            A terrace code your dad picks when raising a defect — e.g. “T41”. Add its
            houses inside it.
          </p>
          <input
            name="name"
            required
            placeholder="T41"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-navy"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white transition-colors active:bg-navy-light"
          >
            Add terrace
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {terraces?.length ? (
            terraces.map((t) => {
              const count =
                (t.addresses as { count: number }[] | null)?.[0]?.count ?? 0;
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <Link
                    href={`/terraces/${t.id}`}
                    className="flex min-w-0 flex-1 items-center justify-between active:opacity-70"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-slate-500">
                        {count} {count === 1 ? "house" : "houses"}
                      </p>
                    </div>
                    <ChevronRightIcon className="text-lg text-slate-300" />
                  </Link>
                  <form action={deleteTerrace}>
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmButton
                      message={`Remove ${t.name} and all its houses?`}
                      className="text-sm font-medium text-red-500 active:text-red-700"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </li>
              );
            })
          ) : (
            <li className="py-8 text-center text-slate-400">
              No terraces yet — add your first above.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
