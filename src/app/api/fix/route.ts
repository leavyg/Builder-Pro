import { NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBaseUrl } from "@/lib/url";
import { formatRef } from "@/lib/format";
import { emailFixSubmitted } from "@/lib/email";

// Contractor submits a "fixed" photo for one of THEIR snags via /c/<token>.
// No login: the contractor's secret token authorises them, and we verify the
// target defect actually belongs to that contractor before accepting anything.
export async function POST(req: Request) {
  const form = await req.formData();
  const contractorToken = String(form.get("contractor_token") ?? "");
  const defectId = String(form.get("defect_id") ?? "");
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File);
  const note = String(form.get("note") ?? "").trim();

  if (!contractorToken || !defectId || photos.length === 0) {
    return NextResponse.json({ error: "At least one photo is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Who is this token? (their contractor row)
  const { data: contractor } = await admin
    .from("contractors")
    .select("id,name")
    .eq("response_token", contractorToken)
    .maybeSingle();
  if (!contractor) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  // The defect must belong to this contractor and still be open.
  const { data: defect } = await admin
    .from("defects")
    .select("id,ref,description,site_id,status,contractor_id,problem_photo_urls")
    .eq("id", defectId)
    .maybeSingle();
  if (!defect || defect.contractor_id !== contractor.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (defect.status !== "open") {
    return NextResponse.json({ error: "Already submitted." }, { status: 409 });
  }

  // Parity: one fix photo per problem photo (at least).
  const required = Math.max(1, defect.problem_photo_urls?.length ?? 1);
  if (photos.length < required) {
    return NextResponse.json(
      { error: `Please add a photo of each item fixed (${required} needed).` },
      { status: 400 },
    );
  }

  // Upload all fix photos (parallel; order preserved → [0] is the cover).
  let paths: string[];
  try {
    paths = await Promise.all(
      photos.map(async (photo) => {
        const path = `${defect.site_id}/fix-${crypto.randomUUID()}.jpg`;
        const buffer = Buffer.from(await photo.arrayBuffer());
        const { error } = await admin.storage
          .from("defect-photos")
          .upload(path, buffer, { contentType: photo.type || "image/jpeg" });
        if (error) throw new Error(error.message);
        return path;
      }),
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  await admin
    .from("defects")
    .update({
      status: "fixed_pending",
      fixed_photo_url: paths[0],
      fixed_photo_urls: paths,
      fixed_at: new Date().toISOString(),
    })
    .eq("id", defect.id);

  await admin.from("defect_events").insert({
    defect_id: defect.id,
    type: "fixed_submitted",
    actor: "contractor",
    note: note || null,
  });

  // Notify the site manager by email (non-blocking).
  const { data: site } = await admin
    .from("sites")
    .select("manager_id")
    .eq("id", defect.site_id)
    .maybeSingle();
  if (site?.manager_id) {
    const { data: mgr } = await admin.auth.admin.getUserById(site.manager_id);
    const managerEmail = mgr.user?.email;
    if (managerEmail) {
      const baseUrl = await getBaseUrl();
      after(async () => {
        await emailFixSubmitted({
          to: managerEmail,
          ref: formatRef(defect.ref),
          description: defect.description,
          contractorName: contractor.name,
          link: `${baseUrl}/defect/${defect.id}`,
        });
      });
    }
  }

  return NextResponse.json({ ok: true });
}
