import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Provider from "@/models/Provider";
import { requireAdmin } from "@/lib/auth";

function normalize(body = {}) {
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    categories: Array.isArray(body.categories) ? body.categories.map(v => String(v).trim()).filter(Boolean).slice(0, 20) : [],
    address: String(body.address || "").trim(),
    city: String(body.city || "").trim(),
    status: ["Available", "Busy", "Inactive"].includes(body.status) ? body.status : "Available",
    experience: Math.max(0, Number(body.experience || 0) || 0),
    notes: String(body.notes || "").trim().slice(0, 2000)
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    await connectDB();
    const providers = await Provider.find().sort({ status: 1, name: 1 }).lean();
    return NextResponse.json({ providers });
  } catch (e) {
    console.error("PROVIDER_LIST_ERROR", e);
    return NextResponse.json({ error: "Unable to load providers." }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const body = await req.json();
    const data = normalize(body);
    if (!data.name) return NextResponse.json({ error: "Provider name is required." }, { status: 400 });

    await connectDB();
    const provider = await Provider.create(data);
    return NextResponse.json({ provider }, { status: 201 });
  } catch (e) {
    console.error("PROVIDER_CREATE_ERROR", e);
    return NextResponse.json({ error: "Unable to create provider." }, { status: 500 });
  }
}
