"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-navy px-5 py-2.5 font-semibold text-white transition-colors active:bg-navy-light print:hidden"
    >
      Save as PDF / Print
    </button>
  );
}
