// One-time setup: creates the manager login account + their site row.
// Run with:  node --env-file=.env scripts/bootstrap.mjs
// Requires MANAGER_PASSWORD in .env (and optionally MANAGER_EMAIL / SITE_NAME).
import { createClient } from "@supabase/supabase-js";

const email = process.env.MANAGER_EMAIL || "gleavy06@gmail.com";
const password = process.env.MANAGER_PASSWORD;
const siteName = process.env.SITE_NAME || "Main Site";

if (!password) {
  console.error("❌ Set MANAGER_PASSWORD in .env first.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// 1. Create the manager user (or reuse if they already exist).
let userId;
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createErr) {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === email);
  if (!existing) {
    console.error("❌ Could not create user:", createErr.message);
    process.exit(1);
  }
  userId = existing.id;
  console.log("ℹ️  Manager already existed:", email);
} else {
  userId = created.user.id;
  console.log("✅ Created manager:", email);
}

// 2. Ensure this manager has a site.
const { data: existingSite } = await supabase
  .from("sites")
  .select("id,name")
  .eq("manager_id", userId)
  .maybeSingle();

if (existingSite) {
  console.log(`ℹ️  Site already exists: "${existingSite.name}"`);
} else {
  const { error: siteErr } = await supabase
    .from("sites")
    .insert({ name: siteName, manager_id: userId });
  if (siteErr) {
    console.error("❌ Could not create site:", siteErr.message);
    process.exit(1);
  }
  console.log(`✅ Created site: "${siteName}"`);
}

console.log("\n🎉 Bootstrap complete — you can now log in.");
