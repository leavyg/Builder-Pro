"use client";

import { useState } from "react";

type C = { id: string; name: string };

export default function ExportForm({ contractors }: { contractors: C[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [contractor, setContractor] = useState("all");

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (status !== "all") qs.set("status", status);
  if (contractor !== "all") qs.set("contractor", contractor);
  const q = qs.toString();

  const field =
    "w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-navy";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="fixed_pending">Awaiting approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Contractor</label>
        <select value={contractor} onChange={(e) => setContractor(e.target.value)} className={field}>
          <option value="all">All contractors</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 pt-2">
        <a
          href={`/api/export?${q}`}
          className="block w-full rounded-xl bg-navy py-3 text-center font-semibold text-white transition-colors active:bg-navy-light"
        >
          Download CSV (spreadsheet)
        </a>
        <a
          href={`/export/report?${q}`}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-xl bg-white py-3 text-center font-semibold text-navy ring-1 ring-slate-300 transition-colors active:bg-slate-50"
        >
          Open report (save as PDF)
        </a>
      </div>
    </div>
  );
}
