import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Company from "@/models/Company";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
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
      company?.email || process.env.CONTACT_EMAIL || ""
    ).trim();

    if (!companyEmail) {
      return NextResponse.json(
        { error: "Company email is not configured." },
        { status: 500 }
      );
    }

    if (process.env.RESEND_API_KEY && (process.env.RESEND_FROM_EMAIL || companyEmail)) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || companyEmail,
          to: [companyEmail],
          ...(email ? { reply_to: email } : {}),
          subject: `Service Request - ${service}`,
          text: [
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Email: ${email || "Not provided"}`,
            `Service: ${service}`,
            `Preferred Date: ${date || "Not specified"}`,
            "",
            "Problem / Requirement:",
            problem || "Not provided",
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("CONTACT_EMAIL_ERROR", errorText);
        return NextResponse.json(
          {
            error:
              "Unable to send the request right now. Please call us directly.",
            phone: company?.phone || "",
            whatsapp: company?.phone || "",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking request sent successfully. We will call you back soon.",
      });
    }

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
        "Your email app is ready with the service request. Please send the email to complete your request.",
    });
  } catch (error) {
    console.error("CONTACT_POST_ERROR", error);
    return NextResponse.json(
      { error: "Unable to process your service request." },
      { status: 500 }
    );
  }
}
