import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import CopyLinkButton from "@/components/CopyLinkButton";
import ConfirmButton from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { addContractor, deleteContractor } from "./actions";

export default async function ContractorsPage() {
  const supabase = await createClient();
  const { data: contractors } = await supabase
    .from("contractors")
    .select("id,name,trade,phone,email,response_token")
    .order("name");

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Contractors" />

      <section className="px-4 py-5">
        {/* Add form */}
        <form action={addContractor} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold">Add a contractor</p>
          <input
            name="name"
            required
            placeholder="Name (e.g. Sean Murphy)"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-navy"
          />
          <input
            name="trade"
            placeholder="Trade (e.g. Electrician)"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-navy"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone (for SMS / WhatsApp)"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-navy"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white transition-colors active:bg-navy-light"
          >
            Add contractor
          </button>
        </form>

        {/* List */}
        <ul className="mt-5 space-y-2">
          {contractors?.length ? (
            contractors.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {[c.trade, c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/contractors/${c.id}/edit`}
                      className="text-sm font-medium text-slate-600 active:text-slate-900"
                    >
                      Edit
                    </Link>
                    <CopyLinkButton token={c.response_token} />
                  </div>
                  <form action={deleteContractor}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton
                      message={`Remove ${c.name}? This can't be undone.`}
                      className="text-sm font-medium text-red-500 active:text-red-700"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-slate-400">
              No contractors yet — add your first above.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
