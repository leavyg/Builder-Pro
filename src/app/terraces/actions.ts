"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSite } from "@/lib/site";

export async function addTerrace(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const site = await getSite();
  if (!site) return;
  const supabase = await createClient();
  await supabase.from("terraces").insert({ site_id: site.id, name });
  revalidatePath("/terraces");
}

export async function deleteTerrace(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("terraces").delete().eq("id", id); // cascades its addresses
  revalidatePath("/terraces");
}

export async function addAddress(formData: FormData) {
  const terraceId = String(formData.get("terrace_id"));
  const label = String(formData.get("label") ?? "").trim();
  if (!terraceId || !label) return;
  const supabase = await createClient();
  await supabase.from("addresses").insert({ terrace_id: terraceId, label });
  revalidatePath(`/terraces/${terraceId}`);
}

export async function deleteAddress(formData: FormData) {
  const id = String(formData.get("id"));
  const terraceId = String(formData.get("terrace_id"));
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath(`/terraces/${terraceId}`);
}
