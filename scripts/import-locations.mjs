// Bulk-import terraces + house addresses.
// Usage: node --env-file=.env scripts/import-locations.mjs path/to/locations.csv
// File format: one "terrace,address" per line, e.g.
//   T41,6 Skylark Park Close
//   T41,8 Skylark Park Close
//   T42,1 Heron Way
// (A header line like "terrace,address" is ignored. Idempotent — re-runnable.)
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const file = process.argv[2] || ".tmp/locations.csv";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: site } = await admin.from("sites").select("id").limit(1).single();
if (!site) {
  console.error("No site found.");
  process.exit(1);
}

const lines = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

let terraceCount = 0;
let addressCount = 0;
const terraceIds = new Map(); // name -> id

for (const line of lines) {
  const i = line.indexOf(",");
  if (i === -1) continue;
  const terrace = line.slice(0, i).trim();
  const address = line.slice(i + 1).trim();
  if (!terrace || !address) continue;
  if (terrace.toLowerCase() === "terrace") continue; // header

  // Upsert the terrace (unique per site+name).
  let terraceId = terraceIds.get(terrace);
  if (!terraceId) {
    const { data, error } = await admin
      .from("terraces")
      .upsert({ site_id: site.id, name: terrace }, { onConflict: "site_id,name" })
      .select("id")
      .single();
    if (error) {
      console.error(`terrace "${terrace}": ${error.message}`);
      continue;
    }
    terraceId = data.id;
    terraceIds.set(terrace, terraceId);
    terraceCount++;
  }

  // Insert the address if it isn't already there.
  const { data: existing } = await admin
    .from("addresses")
    .select("id")
    .eq("terrace_id", terraceId)
    .eq("label", address)
    .maybeSingle();
  if (existing) continue;

  const { error: addErr } = await admin
    .from("addresses")
    .insert({ terrace_id: terraceId, label: address });
  if (addErr) console.error(`address "${address}": ${addErr.message}`);
  else addressCount++;
}

console.log(`✅ Imported ${terraceCount} terrace(s) and ${addressCount} address(es).`);
