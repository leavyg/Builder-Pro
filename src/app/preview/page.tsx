/* TEMPORARY design preview — three look directions + two nav styles, rendered
   with the real colours/fonts. Delete once a direction is chosen. */

function Img() {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
      ▣
    </div>
  );
}

function Card({
  ref_,
  desc,
  who,
  dot,
  label,
  badge,
  bold,
}: {
  ref_: string;
  desc: string;
  who: string;
  dot: string;
  label: string;
  badge: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Img />
      <div className="min-w-0 flex-1">
        <p className={`truncate ${bold ? "font-semibold" : "font-medium"}`}>
          <span className="text-slate-400">{ref_}</span> {desc}
        </p>
        <p className="truncate text-sm text-slate-500">{who}</p>
        <span
          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </span>
      </div>
      <span className="text-slate-300">›</span>
    </div>
  );
}

function Chips({ active }: { active: string }) {
  const items = ["To do 4", "Awaiting 1", "Done 12"];
  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {items.map((t) => (
        <span
          key={t}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
            t.startsWith("To do") ? active : "bg-white text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Phone({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-slate-500">{title}</p>
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border-4 border-slate-800 bg-slate-50 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <main className="min-h-dvh space-y-12 bg-slate-100 px-4 py-10 text-slate-900">
      <h1 className="text-center text-2xl font-bold">Builder-Pro — look options</h1>

      {/* A — Bold & industrial */}
      <Phone title="A · Bold & industrial (charcoal + safety amber)">
        <header className="bg-slate-900 px-5 py-4 text-white">
          <p className="text-base font-extrabold tracking-wide">⛑ BUILDER-PRO</p>
          <p className="text-sm text-slate-300">Portmarnock Site</p>
        </header>
        <div className="space-y-3 p-4">
          <button className="w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-slate-900">
            ＋ NEW DEFECT
          </button>
          <Chips active="bg-amber-500 text-slate-900" />
          <Card ref_="#021" desc="CRACKED RENDER" who="Danny · T41" dot="bg-red-500" label="OPEN" badge="bg-red-100 text-red-700" bold />
          <Card ref_="#020" desc="MISSING HANDLE" who="Sean · T23" dot="bg-amber-500" label="AWAITING" badge="bg-amber-100 text-amber-700" bold />
        </div>
      </Phone>

      {/* B — Premium navy */}
      <Phone title="B · Premium navy (navy header + bottom tabs)">
        <header className="bg-[#13244d] px-5 py-4 text-white">
          <p className="text-base font-bold">◆ Builder Pro</p>
          <p className="text-sm text-slate-300">Portmarnock Site</p>
        </header>
        <div className="space-y-3 p-4 pb-2">
          <button className="w-full rounded-xl bg-[#13244d] py-4 text-base font-semibold text-white">
            ＋ New defect
          </button>
          <Chips active="bg-[#13244d] text-white" />
          <Card ref_="#021" desc="Cracked render" who="Danny · T41" dot="bg-red-500" label="Open" badge="bg-red-100 text-red-700" />
          <Card ref_="#020" desc="Missing handle" who="Sean · T23" dot="bg-amber-500" label="Awaiting" badge="bg-amber-100 text-amber-700" />
        </div>
        <nav className="flex justify-around border-t border-slate-200 bg-white py-2 text-xs text-slate-500">
          <span className="font-semibold text-[#13244d]">⌂ Home</span>
          <span>＋ New</span>
          <span>☰ More</span>
        </nav>
      </Phone>

      {/* C — Clean & minimal */}
      <Phone title="C · Clean & minimal (light, indigo accent)">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <p className="text-base font-bold">Builder-Pro</p>
          <p className="text-sm text-slate-500">Portmarnock Site</p>
        </header>
        <div className="space-y-3 bg-white p-4">
          <button className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold text-white">
            ＋ New defect
          </button>
          <Chips active="bg-indigo-600 text-white" />
          <Card ref_="#021" desc="Cracked render" who="Danny · T41" dot="bg-red-500" label="Open" badge="bg-red-100 text-red-700" />
          <Card ref_="#020" desc="Missing handle" who="Sean · T23" dot="bg-amber-500" label="Awaiting" badge="bg-amber-100 text-amber-700" />
        </div>
      </Phone>

      {/* Nav comparison */}
      <div>
        <h2 className="mb-4 text-center text-lg font-bold">Navigation styles</h2>
        <div className="mx-auto flex max-w-2xl flex-col gap-6 sm:flex-row">
          <div className="flex-1">
            <p className="mb-2 text-center text-sm font-semibold text-slate-500">
              1 · Bottom tab bar (app-like)
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-slate-50" />
              <nav className="flex justify-around border-t border-slate-200 py-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">⌂ Home</span>
                <span>＋ New</span>
                <span>☰ More</span>
              </nav>
            </div>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-center text-sm font-semibold text-slate-500">
              2 · Top header + links
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-xs">
                <span className="font-bold">Builder-Pro</span>
                <span className="text-slate-400">⟳ ⎋</span>
              </div>
              <div className="h-16 bg-slate-50" />
              <div className="flex justify-center gap-6 py-3 text-xs text-slate-500">
                <span>Contractors</span>
                <span>Terraces</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="pb-6 text-center text-sm text-slate-400">
        Tell me an A/B/C + nav 1/2 and I’ll build it for real.
      </p>
    </main>
  );
}
