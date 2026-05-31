"use client";

import { useState } from "react";
import { approveDefect, rejectDefect } from "./actions";

// Approve / Send back. "Send back" reveals a required text box so the manager
// explains what was wrong — the contractor sees this in their email + history.
export default function ReviewActions({ defectId }: { defectId: string }) {
  const [sendingBack, setSendingBack] = useState(false);

  if (sendingBack) {
    return (
      <form
        action={rejectDefect}
        className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-3"
      >
        <input type="hidden" name="id" value={defectId} />
        <label className="block text-sm font-semibold text-slate-700">
          What needs redoing?
        </label>
        <textarea
          name="note"
          required
          rows={3}
          autoFocus
          placeholder="e.g. Sealant still missing along the left edge"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base outline-none transition-colors focus:border-blue-600"
        />
        <p className="text-xs text-slate-500">
          The contractor sees this, and their link reopens for another attempt.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSendingBack(false)}
            className="flex-1 rounded-xl bg-white py-3 font-semibold text-slate-600 ring-1 ring-slate-300 transition-colors active:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition-colors active:bg-red-700"
          >
            Send back
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-3">
      <form action={approveDefect} className="flex-1">
        <input type="hidden" name="id" value={defectId} />
        <button className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors active:bg-green-700">
          Approve
        </button>
      </form>
      <button
        type="button"
        onClick={() => setSendingBack(true)}
        className="flex-1 rounded-xl bg-white py-3 font-semibold text-red-600 ring-1 ring-red-300 transition-colors active:bg-red-50"
      >
        Send back
      </button>
    </div>
  );
}
