import { createAdminClient } from "@/lib/supabase/admin";

// The photo bucket is private, so we hand the browser short-lived signed URLs.
// Returns a map of { storagePath: signedUrl }.
export async function signPhotos(
  paths: string[],
  expiresIn = 3600,
): Promise<Record<string, string>> {
  const clean = paths.filter(Boolean);
  if (!clean.length) return {};

  const admin = createAdminClient();
  const { data } = await admin.storage
    .from("defect-photos")
    .createSignedUrls(clean, expiresIn);

  const map: Record<string, string> = {};
  data?.forEach((d) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}
