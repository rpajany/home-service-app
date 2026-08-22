import nodemailer from "nodemailer";
import { Resend } from "resend";

const provider = (process.env.EMAIL_API || "gmail").trim().toLowerCase();

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function sendEmail({
  to,
  subject,
  text = "",
  html = "",
  replyTo = "",
}) {
  if (!to) throw new Error("Email recipient is required.");
  if (!subject) throw new Error("Email subject is required.");

  if (provider === "gmail") {
    const user = required("GMAIL_USER");
    const password = required("GMAIL_APP_PASSWORD");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: password },
    });

    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    return { success: true, provider: "gmail", messageId: info.messageId };
  }

  if (provider === "resend") {
    const apiKey = required("RESEND_API_KEY");
    const from = required("RESEND_FROM_EMAIL");
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (result.error) {
      throw new Error(result.error.message || "Resend email failed.");
    }

    return {
      success: true,
      provider: "resend",
      messageId: result.data?.id || "",
    };
  }

  throw new Error(
    `Invalid EMAIL_API "${provider}". Use "gmail" or "resend".`
  );
}
