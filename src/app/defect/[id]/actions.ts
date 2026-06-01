"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBaseUrl } from "@/lib/url";
import { formatRef } from "@/lib/format";
import { formatLocation } from "@/lib/location";
import { one } from "@/lib/rel";
import { emailSentBack, emailNewDefect } from "@/lib/email";
import { smsSentBack, smsNewDefect } from "@/lib/sms";

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
    .select("ref,description,contractors(name,email,phone,response_token)")
    .eq("id", id)
    .maybeSingle();
  const c = defect
    ? (Array.isArray(defect.contractors) ? defect.contractors[0] : defect.contractors)
    : null;
  if (c) {
    const baseUrl = await getBaseUrl();
    const link = `${baseUrl}/c/${c.response_token}`;
    const ref = formatRef(defect!.ref);
    after(async () => {
      if (c.email) {
        await emailSentBack({
          to: c.email,
          contractorName: c.name,
          ref,
          description: defect!.description,
          reason: note || undefined,
          link,
        });
      }
      if (c.phone) {
        await smsSentBack({ to: c.phone, ref, reason: note || undefined, link });
      }
    });
  }

  revalidatePath(`/defect/${id}`);
  revalidatePath("/");
}

// Manager edits a defect: description, contractor (reassign), location.
export async function updateDefect(formData: FormData) {
  const id = String(formData.get("id"));
  const description = String(formData.get("description") ?? "").trim();
  const contractorId = String(formData.get("contractor_id") ?? "");
  const addressId = String(formData.get("address_id") ?? "");
  if (!id || !description || !contractorId || !addressId) return;

  const supabase = await createClient(); // RLS scopes to the manager's defect
  const { data: before } = await supabase
    .from("defects")
    .select("contractor_id")
    .eq("id", id)
    .maybeSingle();

  await supabase
    .from("defects")
    .update({ description, contractor_id: contractorId, address_id: addressId })
    .eq("id", id);

  const reassigned = !!before && before.contractor_id !== contractorId;
  const admin = createAdminClient();
  await admin.from("defect_events").insert({
    defect_id: id,
    type: reassigned ? "reassigned" : "edited",
    actor: "manager",
  });

  // On reassign, notify the NEW contractor (non-blocking).
  if (reassigned) {
    const { data: d } = await admin
      .from("defects")
      .select(
        "ref,description,contractors(name,email,phone,response_token),addresses(label,terraces(name))",
      )
      .eq("id", id)
      .maybeSingle();
    const c = one<{
      name: string;
      email: string | null;
      phone: string | null;
      response_token: string;
    }>(d?.contractors);
    if (c) {
      const baseUrl = await getBaseUrl();
      const link = `${baseUrl}/c/${c.response_token}`;
      const ref = formatRef(d!.ref);
      const zone = formatLocation(d!.addresses) || undefined;
      after(async () => {
        if (c.email) {
          await emailNewDefect({
            to: c.email,
            contractorName: c.name,
            ref,
            description,
            zone,
            link,
          });
        }
        if (c.phone) {
          await smsNewDefect({ to: c.phone, ref, description, link });
        }
      });
    }
  }

  revalidatePath(`/defect/${id}`);
  revalidatePath("/");
  redirect(`/defect/${id}`);
}

// Manager deletes a defect raised by mistake.
export async function deleteDefect(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("defects").delete().eq("id", id); // cascades its events
  revalidatePath("/");
  redirect("/");
}
