"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Full-width "Sign out" row (used on the More screen).
export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-red-600 shadow-sm transition-colors active:bg-slate-50"
    >
      Sign out
      <span className="text-slate-300">›</span>
    </button>
  );
}
