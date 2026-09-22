/**
 * Outbound mail seam. Password-reset links are the only mail the auth system
 * sends. Transports:
 *
 *   MAIL_TRANSPORT=console  print the message (development / tests ONLY —
 *                           the body contains a live reset link)
 *   MAIL_TRANSPORT=none     drop the message and log a warning (production
 *                           default until a real provider is wired in here)
 *
 * To go live, add a provider (SMTP, SES, Resend…) as another branch below and
 * set MAIL_TRANSPORT accordingly. Nothing else in the app needs to change.
 */
export type Mail = { to: string; subject: string; text: string };

function transport() {
  const configured = process.env["MAIL_TRANSPORT"];
  if (configured === "console" || configured === "none") return configured;
  return process.env.NODE_ENV === "production" ? "none" : "console";
}

export async function sendMail(mail: Mail) {
  if (transport() === "console") {
    console.info(
      `[mail] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}\n[/mail]`,
    );
    return;
  }
  console.warn(`[mail] no mail transport configured; dropped "${mail.subject}" (recipient hidden)`);
}
