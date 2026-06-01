// Shown instantly during navigation while the next page's data loads, so taps
// feel responsive instead of "nothing happening for a moment".
export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-navy" />
    </div>
  );
}
