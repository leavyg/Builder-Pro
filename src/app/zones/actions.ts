"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSite } from "@/lib/site";

export async function addZone(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;

  const site = await getSite();
  if (!site) return;

  const supabase = await createClient();
  await supabase.from("zones").insert({ site_id: site.id, label });
  revalidatePath("/zones");
}

export async function deleteZone(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("zones").delete().eq("id", id);
  revalidatePath("/zones");
}
