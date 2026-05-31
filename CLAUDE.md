# Builder-Pro — Site Defect Tracker

Mobile web app for a building-site manager (Gerard's father). He photographs sub-standard work,
assigns it to one contractor, and gets back a photo of the fix to approve. Permanent record of every
defect and resolution. Pilot: one site, one manager.

> **This is NOT a WAT project.** Ignore the `tools/`+`workflows/` framework from `~/.claude/CLAUDE.md`
> — this is a standalone Next.js app with its own backend.

## Core loop
Manager snaps photo → assigns ONE contractor → contractor opens a **no-login token link**
(`/fix/<token>`) → uploads "fixed" photo → manager approves/rejects.
Status: `open` 🔴 → `fixed_pending` 🟡 → `approved` 🟢 (reject → back to 🔴). All transitions logged.

## Design principles (non-negotiable)
1. **Capture-to-send in seconds:** snap → tap contractor → tap zone → one voice-to-text line → send.
   Only photo + contractor + one-line description are required; nothing else blocks sending.
2. **Notify ONLY the assigned contractor**, never the whole site. One `contractor_id` per defect.

## Stack
- Next.js 16 (App Router, `src/`) + Tailwind v4 + TypeScript
- Supabase: Postgres, Auth, Storage, RLS
- Vercel hosting
- Notifications: email (Nodemailer + Gmail app password) first, then SMS (Twilio), WhatsApp later
- Secrets in `.env` (gitignored). Service-role key is server-only — never expose to the browser.

## Working notes
- Full plan: `~/.claude/plans/this-is-a-new-elegant-marble.md`
- Gerard is a beginner coder — explain as you build, keep it concise.

@AGENTS.md
