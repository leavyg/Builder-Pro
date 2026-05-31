import "server-only";
import nodemailer from "nodemailer";

// Email via Gmail SMTP using the app password in .env. All sends are wrapped so
// a mail failure never breaks the underlying action (defect still gets created).

const FROM = `Builder-Pro <${process.env.GMAIL_USER}>`;

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function send(to: string, subject: string, html: string) {
  if (!to || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[email] missing config or recipient — skipping:", subject);
    return;
  }
  try {
    await transporter().sendMail({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("[email] send failed:", (e as Error).message);
  }
}

function shell(
  heading: string,
  body: string,
  cta: { label: string; href: string },
) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
    <p style="font-size:13px;font-weight:700;letter-spacing:.04em;color:#94a3b8;margin:0 0 6px">BUILDER-PRO</p>
    <h1 style="font-size:20px;margin:0 0 14px">${heading}</h1>
    <div style="font-size:15px;line-height:1.55;color:#334155">${body}</div>
    <a href="${cta.href}" style="display:inline-block;margin-top:22px;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:12px">${cta.label}</a>
    <p style="font-size:12px;color:#94a3b8;margin-top:28px">Builder-Pro · Site defect management</p>
  </div>`;
}

// 1. New defect raised → notify the assigned contractor.
export async function emailNewDefect(o: {
  to: string;
  contractorName: string;
  ref: string;
  description: string;
  zone?: string;
  link: string;
}) {
  await send(
    o.to,
    `New job ${o.ref}: ${o.description}`,
    shell(
      `Hi ${o.contractorName}, you have a new job`,
      `<p><strong>${o.ref}</strong> — ${o.description}</p>${
        o.zone ? `<p style="color:#64748b">Location: ${o.zone}</p>` : ""
      }<p>Open it below, and send back a photo once the work is done.</p>`,
      { label: "View the job", href: o.link },
    ),
  );
}

// 2. Contractor submitted a fix → notify the manager to review.
export async function emailFixSubmitted(o: {
  to: string;
  ref: string;
  description: string;
  contractorName: string;
  link: string;
}) {
  await send(
    o.to,
    `${o.ref} marked fixed — needs your approval`,
    shell(
      `A fix is ready to review`,
      `<p>${o.contractorName} marked <strong>${o.ref}</strong> — ${o.description} — as fixed.</p><p>Check the photo, then approve or send it back.</p>`,
      { label: "Review now", href: o.link },
    ),
  );
}

// 3. Manager sent a fix back → notify the contractor their link reopened.
export async function emailSentBack(o: {
  to: string;
  contractorName: string;
  ref: string;
  description: string;
  reason?: string;
  link: string;
}) {
  await send(
    o.to,
    `${o.ref} sent back — needs another look`,
    shell(
      `Hi ${o.contractorName}, a job needs another look`,
      `<p><strong>${o.ref}</strong> — ${o.description} — wasn't approved and has been reopened.</p>${
        o.reason
          ? `<p style="background:#fef2f2;border-radius:10px;padding:12px;color:#991b1b"><strong>What needs redoing:</strong> ${o.reason}</p>`
          : ""
      }<p>Please take another look and resubmit when it's done.</p>`,
      { label: "View the job", href: o.link },
    ),
  );
}
