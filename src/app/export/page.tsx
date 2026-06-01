import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import ExportForm from "./ExportForm";

export default async function ExportPage() {
  const supabase = await createClient();
  const { data: contractors } = await supabase
    .from("contractors")
    .select("id,name")
    .order("name");

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="Export records" back="/more" />
      <section className="px-4 py-5">
        <p className="mb-4 text-sm text-slate-500">
          Filter by date, status or contractor, then download a spreadsheet or a
          printable report.
        </p>
        <ExportForm contractors={contractors ?? []} />
      </section>
    </main>
  );
}
