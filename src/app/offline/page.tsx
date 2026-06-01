import Logo from "@/components/Logo";

// Shown only when offline and the requested page isn't cached yet.
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
      <Logo className="text-navy text-2xl" />
      <h1 className="mt-6 text-xl font-bold">You’re offline</h1>
      <p className="mt-2 max-w-xs text-slate-500">
        This screen hasn’t been opened yet, so it can’t load without signal. Any
        defects you’ve captured are saved and will send automatically when you’re
        back online.
      </p>
    </main>
  );
}
