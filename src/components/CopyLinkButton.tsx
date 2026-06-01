"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@/components/icons";

// Copies a contractor's full /c/<token> link to the clipboard so the manager can
// paste it into WhatsApp/SMS manually (until Phase 3 sends it automatically).
export default function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/c/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — fall back to a prompt
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-sm font-medium text-navy active:text-navy"
    >
      {copied ? (
        <>
          <CheckIcon className="text-sm" />
          Copied
        </>
      ) : (
        <>
          <ClipboardIcon className="text-sm" />
          Copy link
        </>
      )}
    </button>
  );
}
