import "server-only";
import twilio from "twilio";

// SMS via Twilio. TWILIO_SENDER can be an alphanumeric ID ("BuilderPro") or a
// Twilio phone number. Like email, all sends are guarded so a failure never
// breaks the underlying action.

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDER = process.env.TWILIO_SENDER;

// Normalise Irish-style numbers to E.164 (Twilio requires +353…).
function toE164(raw: string): string {
  const p = raw.replace(/[\s()\-.]/g, "");
  if (p.startsWith("+")) return p;
  if (p.startsWith("00")) return "+" + p.slice(2);
  if (p.startsWith("0")) return "+353" + p.slice(1); // Ireland default
  return p;
}

function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

async function sendSms(to: string, body: string) {
  if (!to || !SID || !TOKEN || !SENDER) {
    console.warn("[sms] missing config or recipient — skipping");
    return;
  }
  try {
    const client = twilio(SID, TOKEN);
    await client.messages.create({ to: toE164(to), from: SENDER, body });
  } catch (e) {
    console.error("[sms] send failed:", (e as Error).message);
  }
}

export async function smsNewDefect(o: {
  to: string;
  ref: string;
  description: string;
  link: string;
}) {
  await sendSms(
    o.to,
    `Builder-Pro: New job ${o.ref} — ${truncate(o.description)}. View & send a photo when done: ${o.link}`,
  );
}

export async function smsSentBack(o: {
  to: string;
  ref: string;
  reason?: string;
  link: string;
}) {
  await sendSms(
    o.to,
    `Builder-Pro: Job ${o.ref} sent back${
      o.reason ? ` — ${truncate(o.reason)}` : ""
    }. View & resubmit: ${o.link}`,
  );
}
