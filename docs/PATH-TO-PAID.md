# Builder-Pro — Path to Paid

A prioritised checklist for turning the pilot into a sellable product. **Golden rule:
don't build Phase 1 until the pilot proves real people will use it / pay for it.**

---

## Phase 0 — Validate (during / right after the pilot)
*No code. This gates everything.*
- [ ] Run the pilot on Dad's site; confirm it genuinely saves time and contractors actually use the links.
- [ ] Decide the buyer (small builders? sub-contractor firms? developers?) and pricing (per site / month).
- [ ] Collect 2–3 real bits of feedback before building more.

## Phase 1 — Foundations to take money safely
*The real "pilot → product" hardening pass. The two that truly gate charging are
**multi-tenant isolation** and **GDPR/legal**.*

**Security & multi-tenancy (biggest lift)**
- [ ] Tenant model: organisation → site(s) → users; every table carries org/site id.
- [ ] Rewrite + **test** RLS so customer A can never read customer B (automated tests).
- [ ] Roles per site (owner / manager / foreman) + invite flow.
- [ ] Rate limiting on public endpoints (login, `/api/fix`, `/c/<token>`).
- [ ] Server-side upload validation: enforce image MIME + size cap.
- [ ] Contractor link lifecycle: expiry / rotation (and/or optional contractor accounts).

**Production notifications**
- [ ] Transactional email on a real domain (Resend/Postmark + SPF/DKIM) — drop personal Gmail.
- [ ] Registered SMS sender (business/sole-trader Twilio + domain) — fixes "Likely Scam".

**Legal / GDPR** (storing real addresses, site photos, contractor PII)
- [ ] Privacy policy + terms of service.
- [ ] Lawful basis + consent for contractor personal data.
- [ ] Data retention + deletion ("delete my data") + export.
- [ ] Data-processing agreement template for customers (EU residency already ✓).

**Ops / reliability**
- [ ] Supabase Pro: daily point-in-time backups, no project pausing, storage headroom.
- [ ] Error tracking (Sentry) + uptime monitoring + audit logs.
- [ ] Staging environment + CI (build + `npm audit` + tests) before deploy.

**Billing & onboarding**
- [ ] Stripe subscriptions (per site/month) + trial + billing portal.
- [ ] Self-serve signup + create-site onboarding (replace the manual bootstrap script).
- [ ] Custom domain + branding.

## Phase 2 — Make it sellable & sticky (shortly after launch)
- [ ] Auto-reminders / escalation for stale defects.
- [ ] Reporting polish (year-end + per-contractor performance).
- [ ] Search + pagination on the dashboard (scales past hundreds of defects).
- [ ] In-app help / onboarding for non-technical managers.
- [ ] WhatsApp channel (if pilots show contractors prefer it).
- [ ] Photo lightbox/zoom, relative timestamps, richer empty states.

## Phase 3 — Scale & differentiate (later)
- [ ] Multiple sites per manager + cross-site dashboard.
- [ ] OpenAI Vision: auto-categorise defects / auto-route by trade.
- [ ] Offline on the contractor side; background sync where supported.
- [ ] Builder analytics (defects per contractor, time-to-fix).
- [ ] Light security review / pen-test before scaling customer numbers.

---

### Cheapest high-impact early wins
1. **Email/SMS on a real domain** — helps the pilot *and* is needed for paid.
2. **Supabase Pro** — backups + no pausing, for a few €/month.
3. **Rate limiting + upload validation** — small effort, closes the main abuse gaps.
