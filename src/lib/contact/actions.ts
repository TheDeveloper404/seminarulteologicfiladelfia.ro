"use server";

import { MailerooClient, EmailAddress } from "maileroo-sdk";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { contactSchema } from "./schema";

export type ContactFormState = { error: string } | { success: true } | null;

const CONTACT_FROM_EMAIL = "contact@seminarulteologicfiladelfia.ro";
const CONTACT_TO_EMAIL = "seminar.filadelfia@gmail.com";

function renderHtml({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8" /></head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e4e4e7;">
        <tr>
          <td style="background-color:#16213c; padding:24px 32px;">
            <span style="color:#ffffff; font-size:18px; font-weight:600;">Seminarul Teologic Filadelfia</span>
            <div style="color:#c7cad6; font-size:13px; margin-top:4px;">Mesaj nou din formularul de contact</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:13px; color:#71717a; width:110px; vertical-align:top;">Nume</td>
                  <td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:15px; color:#18181b; vertical-align:top;">${escape(name)}</td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:13px; color:#71717a; vertical-align:top;">Email</td>
                  <td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:15px; vertical-align:top;">
                    <a href="mailto:${escape(email)}" style="color:#16213c; text-decoration:none;">${escape(email)}</a>
                  </td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:13px; color:#71717a; vertical-align:top;">Telefon</td>
                  <td style="padding:10px 0; border-bottom:1px solid #eeeeef; font-size:15px; color:#18181b; vertical-align:top;">${escape(phone) || "—"}</td></tr>
            </table>
            <div style="font-size:13px; color:#71717a; margin-bottom:8px;">Mesaj</div>
            <div style="font-size:15px; color:#18181b; line-height:1.6; white-space:pre-wrap;">${escape(message)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px; background-color:#f9f9fa; border-top:1px solid #eeeeef;">
            <span style="font-size:12px; color:#a1a1aa;">Trimis automat de pe seminarulteologicfiladelfia.ro</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const ip = await getClientIp();
  if (await isRateLimited(`contact:${ip}`)) {
    return { error: "Prea multe încercări. Te rugăm încearcă din nou peste câteva minute." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    return { error: "Verifică datele completate și încearcă din nou." };
  }

  const { name, email, phone, message, company } = parsed.data;

  if (company) {
    // honeypot completat — respinge silențios, fără request către Maileroo
    return { success: true };
  }

  const apiKey = process.env.MAILEROO_API_KEY;
  if (!apiKey) {
    return { error: "A apărut o eroare la trimitere. Te rugăm încearcă din nou sau contactează-ne telefonic." };
  }

  try {
    const client = new MailerooClient(apiKey);
    await client.sendBasicEmail({
      from: new EmailAddress(CONTACT_FROM_EMAIL, "Seminarul Teologic Filadelfia"),
      to: [new EmailAddress(CONTACT_TO_EMAIL)],
      reply_to: new EmailAddress(email, name),
      subject: `Mesaj nou de contact de la ${name}`,
      html: renderHtml({ name, email, phone: phone ?? "", message }),
      plain: `Nume: ${name}\nEmail: ${email}\nTelefon: ${phone || "—"}\n\nMesaj:\n${message}`,
    });
    return { success: true };
  } catch {
    return { error: "A apărut o eroare la trimitere. Te rugăm încearcă din nou sau contactează-ne telefonic." };
  }
}
