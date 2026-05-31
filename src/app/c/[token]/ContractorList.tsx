"use client";

import { useState } from "react";
import Link from "next/link";
import { STATUS, type Status } from "@/lib/status";
import { formatRef } from "@/lib/format";
import { ChevronRightIcon } from "@/components/icons";

export type SnagRow = {
  id: string;
  ref: number;
  description: string;
  status: Status;
  thumb?: string;
  zone?: string;
};

const FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "To do" },
  { key: "fixed_pending", label: "Awaiting" },
  { key: "approved", label: "Done" },
];

export default function ContractorList({
  rows,
  token,
}: {
  rows: SnagRow[];
  token: string;
}) {
  const [status, setStatus] = useState<"all" | Status>("all");
  const filtered = rows.filter((r) => status === "all" || r.status === status);

  return (
    <>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 py-1.5">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? rows.length
              : rows.filter((r) => r.status === f.key).length;
          const active = status === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center text-slate-400">
          {rows.length === 0 ? "No jobs assigned yet." : "Nothing here."}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const s = STATUS[r.status];
            return (
              <li key={r.id}>
                <Link
                  href={`/c/${token}/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors active:bg-slate-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.thumb}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      <span className="text-slate-400">{formatRef(r.ref)}</span>{" "}
                      {r.description}
                    </p>
                    {r.zone && (
                      <p className="truncate text-sm text-slate-500">{r.zone}</p>
                    )}
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  <ChevronRightIcon className="shrink-0 text-lg text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
