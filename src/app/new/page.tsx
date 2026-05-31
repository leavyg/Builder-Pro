import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import NewDefectForm from "./NewDefectForm";

export default async function NewDefectPage() {
  const supabase = await createClient();
  const [{ data: contractors }, { data: zones }] = await Promise.all([
    supabase.from("contractors").select("id,name,trade").order("name"),
    supabase.from("zones").select("id,label").order("label"),
  ]);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="New defect" />
      {contractors && contractors.length > 0 ? (
        <NewDefectForm contractors={contractors} zones={zones ?? []} />
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-slate-500">
            Add a contractor first so there’s someone to assign this to.
          </p>
          <Link
            href="/contractors"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Add a contractor
          </Link>
        </div>
      )}
    </main>
  );
}
