import { headers } from "next/headers";

// Builds the app's base URL from the incoming request, so email links point at
// localhost in dev and the real domain in production — no env var needed.
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
