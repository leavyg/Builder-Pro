"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBaseUrl } from "@/lib/url";
import { formatRef } from "@/lib/format";
import { emailSentBack } from "@/lib/email";

// Manager approves a submitted fix → defect closed (green).
export async function approveDefect(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient(); // RLS ensures it's the manager's defect

  await supabase
    .from("defects")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);

  // Event inserts use admin (defect_events has no insert policy by design).
  await createAdminClient()
    .from("defect_events")
    .insert({ defect_id: id, type: "approved", actor: "manager" });

  revalidatePath(`/defect/${id}`);
  revalidatePath("/");
}

// Manager rejects a submitted fix → back to open (red); contractor link works again.
export async function rejectDefect(formData: FormData) {
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();
  const supabase = await createClient();

  await supabase
    .from("defects")
    .update({ status: "open", fixed_photo_url: null, fixed_at: null })
    .eq("id", id);

  const admin = createAdminClient();
  await admin.from("defect_events").insert({
    defect_id: id,
    type: "rejected",
    actor: "manager",
    note: note || null,
  });

  // Notify the contractor their link has reopened (non-blocking).
  const { data: defect } = await admin
    .from("defects")
    .select("ref,description,contractors(name,email,response_token)")
    .eq("id", id)
    .maybeSingle();
  const c = defect
    ? (Array.isArray(defect.contractors) ? defect.contractors[0] : defect.contractors)
    : null;
  if (c?.email) {
    const baseUrl = await getBaseUrl();
    after(async () => {
      await emailSentBack({
        to: c.email,
        contractorName: c.name,
        ref: formatRef(defect!.ref),
        description: defect!.description,
        link: `${baseUrl}/c/${c.response_token}`,
      });
    });
  }

  revalidatePath(`/defect/${id}`);
  revalidatePath("/");
}
