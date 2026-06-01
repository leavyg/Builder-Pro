"use client";

import { useState } from "react";
import Link from "next/link";
import { STATUS, type Status } from "@/lib/status";
import { formatRef } from "@/lib/format";
import { ChevronRightIcon } from "@/components/icons";

export type DefectRow = {
  id: string;
  ref: number;
  description: string;
  status: Status;
  thumb?: string;
  zone?: string;
  contractor?: string;
  photoCount: number;
};

const FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "fixed_pending", label: "Awaiting" },
  { key: "open", label: "Open" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
];

export default function DashboardList({ defects }: { defects: DefectRow[] }) {
  const [status, setStatus] = useState<"all" | Status>("fixed_pending");
  const [contractor, setContractor] = useState<string>("all");

  const contractors = Array.from(
    new Set(defects.map((d) => d.contractor).filter(Boolean)),
  ) as string[];

  const filtered = defects.filter(
    (d) =>
      (status === "all" || d.status === status) &&
      (contractor === "all" || d.contractor === contractor),
  );

  return (
    <>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 py-1.5">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? defects.length
              : defects.filter((d) => d.status === f.key).length;
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

      {contractors.length > 1 && (
        <select
          value={contractor}
          onChange={(e) => setContractor(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
        >
          <option value="all">All contractors</option>
          {contractors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center text-slate-400">
          {defects.length === 0
            ? "No defects yet. Tap “New defect” to raise your first."
            : "Nothing matches this filter."}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((d) => {
            const s = STATUS[d.status];
            return (
              <li key={d.id}>
                <Link
                  href={`/defect/${d.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors active:bg-slate-50"
                >
                  <div className="relative h-16 w-16 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.thumb}
                      alt=""
                      className="h-16 w-16 rounded-xl bg-slate-100 object-cover"
                    />
                    {d.photoCount > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/65 px-1 text-[10px] font-semibold text-white">
                        +{d.photoCount - 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      <span className="text-slate-400">{formatRef(d.ref)}</span>{" "}
                      {d.description}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {d.contractor}
                      {d.zone ? ` · ${d.zone}` : ""}
                    </p>
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
