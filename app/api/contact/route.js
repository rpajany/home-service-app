import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Company from "@/models/Company";
import { sendEmail } from "@/lib/email";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildMailto({ to, name, phone, email, service, date, problem }) {
  const subject = `Service Request - ${service || "Home Service"}`;
  const body = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Service: ${service}`,
    `Preferred Date: ${date || "Not specified"}`,
    "",
    "Problem / Requirement:",
    problem || "Not provided",
  ].join("\n");

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const name = clean(body?.name, 100);
    const phone = clean(body?.phone, 40);
    const email = clean(body?.email, 150);
    const service = clean(body?.service, 120);
    const date = clean(body?.date, 40);
    const problem = clean(body?.problem, 1000);

    if (!name || !phone || !service) {
      return NextResponse.json(
        { error: "Name, phone number and service are required." },
        { status: 400 }
      );
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const company = await Company.findOne().lean();
    const companyEmail = String(
      company?.email || process.env.COMPANY_EMAIL || process.env.CONTACT_EMAIL || ""
    ).trim();

    if (!companyEmail) {
      return NextResponse.json(
        { error: "Company email is not configured." },
        { status: 500 }
      );
    }

    const subject = `Service Request - ${service}`;

    const text = [
      "New Service Request",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email || "Not provided"}`,
      `Service: ${service}`,
      `Preferred Date: ${date || "Not specified"}`,
      "",
      "Problem / Requirement:",
      problem || "Not provided",
    ].join("\n");

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#222">
        <h2 style="color:#7045e8">New Service Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Preferred Date:</strong> ${escapeHtml(date || "Not specified")}</p>
        <p><strong>Problem / Requirement:</strong></p>
        <p>${escapeHtml(problem || "Not provided").replace(/\n/g, "<br />")}</p>
      </div>
    `;

    try {
      const result = await sendEmail({
        to: companyEmail,
        subject,
        text,
        html,
        replyTo: email,
      });

      return NextResponse.json({
        success: true,
        provider: result.provider,
        message: "Booking request sent successfully. We will call you back soon.",
      });
    } catch (emailError) {
      console.error("CONTACT_EMAIL_ERROR", emailError);

      // Keep the existing fallback behavior when server email is not configured
      // or delivery fails. The customer can still send the request manually.
      return NextResponse.json({
        success: true,
        fallback: true,
        mailto: buildMailto({
          to: companyEmail,
          name,
          phone,
          email,
          service,
          date,
          problem,
        }),
        message:
          "Server email delivery is not available. Your email app is ready with the service request.",
      });
    }
  } catch (error) {
    console.error("CONTACT_POST_ERROR", error);
    return NextResponse.json(
      { error: "Unable to process your service request." },
      { status: 500 }
    );
  }
}
