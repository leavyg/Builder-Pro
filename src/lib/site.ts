import { createClient } from "@/lib/supabase/server";

// Returns the logged-in manager's site (RLS guarantees it's only ever theirs).
export async function getSite() {
  const supabase = await createClient();
  const { data } = await supabase.from("sites").select("id,name").maybeSingle();
  return data;
}
