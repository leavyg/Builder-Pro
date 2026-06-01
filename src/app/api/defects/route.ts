import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSite } from "@/lib/site";
import { getBaseUrl } from "@/lib/url";
import { formatRef } from "@/lib/format";
import { emailNewDefect } from "@/lib/email";
import { smsNewDefect } from "@/lib/sms";

// Creates a new defect: uploads the photo to Storage and inserts the defect +
// its first audit event. Auth is checked via the manager's session; the upload
// and inserts use the admin client (the photo bucket is private).
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const site = await getSite();
  if (!site) {
    return NextResponse.json({ error: "No site" }, { status: 400 });
  }

  const form = await req.formData();
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File);
  const contractorId = String(form.get("contractor_id") ?? "");
  const addressId = String(form.get("address_id") ?? "") || null;
  const description = String(form.get("description") ?? "").trim();
  const latRaw = form.get("gps_lat");
  const lngRaw = form.get("gps_lng");

  if (photos.length === 0 || !contractorId || !description || !addressId) {
    return NextResponse.json(
      { error: "Photo, contractor, location and description are all required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Validate the chosen house belongs to this manager's site.
  const { data: address } = await admin
    .from("addresses")
    .select("id,label,terraces(name,site_id)")
    .eq("id", addressId)
    .maybeSingle();
  const terrace = address
    ? Array.isArray(address.terraces)
      ? address.terraces[0]
      : address.terraces
    : null;
  if (!address || !terrace || terrace.site_id !== site.id) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }
  const locationStr = `${terrace.name} · ${address.label}`;

  // Upload all photos (parallel; result order matches input, so [0] is the cover).
  let paths: string[];
  try {
    paths = await Promise.all(
      photos.map(async (photo) => {
        const path = `${site.id}/${crypto.randomUUID()}.jpg`;
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

  // Insert the defect (status defaults to 'open').
  const { data: defect, error: insertErr } = await admin
    .from("defects")
    .insert({
      site_id: site.id,
      contractor_id: contractorId,
      address_id: addressId,
      problem_photo_url: paths[0],
      problem_photo_urls: paths,
      description,
      gps_lat: latRaw ? Number(latRaw) : null,
      gps_lng: lngRaw ? Number(lngRaw) : null,
      created_by: user.id,
    })
    .select("id,ref")
    .single();
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // First audit-trail entry.
  await admin
    .from("defect_events")
    .insert({ defect_id: defect.id, type: "created", actor: "manager" });

  // Notify the assigned contractor by email (after the response — non-blocking).
  const { data: contractor } = await admin
    .from("contractors")
    .select("name,email,phone,response_token")
    .eq("id", contractorId)
    .maybeSingle();

  if (contractor) {
    const baseUrl = await getBaseUrl();
    const link = `${baseUrl}/c/${contractor.response_token}`;
    const ref = formatRef(defect.ref);
    after(async () => {
      if (contractor.email) {
        await emailNewDefect({
          to: contractor.email,
          contractorName: contractor.name,
          ref,
          description,
          zone: locationStr,
          link,
        });
      }
      if (contractor.phone) {
        await smsNewDefect({ to: contractor.phone, ref, description, link });
      }
    });
  }

  return NextResponse.json({ id: defect.id });
}
