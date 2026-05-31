import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client tied to the logged-in manager's session (via
// cookies). Still uses the anon key, so RLS applies — the manager only ever
// sees their own site's data. Use this in Server Components, Server Actions,
// and Route Handlers that act AS the logged-in user.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Can throw when called from a Server Component (read-only cookies).
          // The session is refreshed by middleware, so this is safe to ignore.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // no-op
          }
        },
      },
    },
  );
}
