"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSite } from "@/lib/site";

export async function addContractor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const trade = String(formData.get("trade") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name) return;

  const site = await getSite();
  if (!site) return;

  const supabase = await createClient();
  await supabase.from("contractors").insert({
    site_id: site.id,
    name,
    trade: trade || null,
    phone: phone || null,
    email: email || null,
  });

  revalidatePath("/contractors");
}

export async function updateContractor(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const trade = String(formData.get("trade") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name) return;

  const supabase = await createClient(); // RLS scopes to the manager's site
  await supabase
    .from("contractors")
    .update({
      name,
      trade: trade || null,
      phone: phone || null,
      email: email || null,
    })
    .eq("id", id);

  redirect("/contractors");
}

export async function deleteContractor(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  // Will fail (and no-op) if defects still reference this contractor — by design.
  await supabase.from("contractors").delete().eq("id", id);
  revalidatePath("/contractors");
}
