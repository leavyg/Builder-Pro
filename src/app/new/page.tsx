import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import NewDefectForm from "./NewDefectForm";

function Setup({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-slate-500">{message}</p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function NewDefectPage() {
  const supabase = await createClient();
  const [{ data: contractors }, { data: terraces }] = await Promise.all([
    supabase.from("contractors").select("id,name,trade").order("name"),
    supabase.from("terraces").select("id,name,addresses(id,label)").order("name"),
  ]);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <AppHeader title="New defect" />
      {!contractors?.length ? (
        <Setup
          message="Add a contractor first so there’s someone to assign this to."
          href="/contractors"
          cta="Add a contractor"
        />
      ) : !terraces?.length ? (
        <Setup
          message="Add a terrace and its houses first so you can set a location."
          href="/terraces"
          cta="Add terraces"
        />
      ) : (
        <NewDefectForm contractors={contractors} terraces={terraces} />
      )}
    </main>
  );
}
