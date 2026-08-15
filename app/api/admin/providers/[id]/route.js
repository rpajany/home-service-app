import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid provider ID." }, { status: 400 });

  try {
    const data = normalize(await req.json());
    if (!data.name) return NextResponse.json({ error: "Provider name is required." }, { status: 400 });

    await connectDB();
    const provider = await Provider.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });
    return NextResponse.json({ provider });
  } catch (e) {
    console.error("PROVIDER_UPDATE_ERROR", e);
    return NextResponse.json({ error: "Unable to update provider." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid provider ID." }, { status: 400 });

  try {
    await connectDB();
    const provider = await Provider.findByIdAndDelete(id).lean();
    if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });
    return NextResponse.json({ ok: true, provider });
  } catch (e) {
    console.error("PROVIDER_DELETE_ERROR", e);
    return NextResponse.json({ error: "Unable to delete provider." }, { status: 500 });
  }
}
