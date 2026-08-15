import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import Provider from "@/models/Provider";
import Category from "@/models/Category";
import Booking from "@/models/Booking";
import { requireAdmin } from "@/lib/auth";
import { uploadServiceImage, deleteCloudinaryImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

function slugify(value = "") { return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }
function parseFormValue(form, key, fallback = "") { const value = form.get(key); return value == null ? fallback : String(value); }
function parseArray(form, key, fallback = []) { const value = form.get(key); if (value == null || value === "") return fallback; try { const parsed = JSON.parse(String(value)); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; } }
async function normalizeForm(form) {
  const name = parseFormValue(form, "name").trim();
  return { slug: slugify(parseFormValue(form, "slug") || name), name, category: parseFormValue(form, "category").trim(), providerName: parseFormValue(form, "providerName").trim(), address: parseFormValue(form, "address").trim(), city: parseFormValue(form, "city", "New York").trim(), email: parseFormValue(form, "email").trim().toLowerCase(), description: parseFormValue(form, "description").trim().slice(0, 2000), image: parseFormValue(form, "image").trim(), imagePublicId: parseFormValue(form, "imagePublicId").trim(), gallery: parseArray(form, "gallery").map(v => String(v).trim()).filter(Boolean).slice(0, 10), rating: Math.max(0, Math.min(5, Number(parseFormValue(form, "rating", "4.8")) || 4.8)), reviews: Math.max(0, Number(parseFormValue(form, "reviews", "0")) || 0), availableFrom: parseFormValue(form, "availableFrom", "08:00"), availableTo: parseFormValue(form, "availableTo", "22:00"), slots: parseArray(form, "slots", []).map(v => String(v).trim()).filter(Boolean).slice(0, 50) };
}
async function validateReferences(data) {
  const category = await Category.findOne({ name: data.category, active: true }).lean(); if (!category) return "Please select an active service category.";
  const provider = await Provider.findOne({ name: data.providerName, status: { $ne: "Inactive" } }).lean(); if (!provider) return "Selected provider was not found or is inactive.";
  if (provider.categories?.length && !provider.categories.includes(data.category)) return `Provider ${provider.name} is not assigned to the ${data.category} category. Add this category to the provider first.`;
  if (!data.address) return "Service address is required."; return null;
}

export async function PATCH(req, { params }) {
  const session = await requireAdmin(); if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params; if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid service ID." }, { status: 400 });
  try {
    await connectDB();
    const existing = await Service.findById(id).lean(); if (!existing) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    const form = await req.formData(); const data = await normalizeForm(form);
    if (!data.name) return NextResponse.json({ error: "Service name is required." }, { status: 400 });
    if (!data.image) { data.image = existing.image; data.imagePublicId = existing.imagePublicId || ""; }
    const err = await validateReferences(data); if (err) return NextResponse.json({ error: err }, { status: 400 });

    const file = form.get("imageFile");
    let uploadedPublicId = "";
    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      if (!String(file.type || "").startsWith("image/")) return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
      if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Service image must be 5 MB or smaller." }, { status: 400 });
      const uploaded = await uploadServiceImage(Buffer.from(await file.arrayBuffer()), file.name || "service-image");
      data.image = uploaded.secure_url; data.imagePublicId = uploaded.public_id; uploadedPublicId = uploaded.public_id;
    }

    if (!data.slots.length) data.slots = existing.slots || [];
    const service = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!service) { if (uploadedPublicId) await deleteCloudinaryImage(uploadedPublicId); return NextResponse.json({ error: "Service not found." }, { status: 404 }); }
    if (uploadedPublicId && existing.imagePublicId && existing.imagePublicId !== uploadedPublicId) await deleteCloudinaryImage(existing.imagePublicId);
    return NextResponse.json({ service });
  } catch (e) {
    console.error("ADMIN_SERVICE_UPDATE_ERROR", e);
    if (e?.message?.includes("Cloudinary is not configured")) return NextResponse.json({ error: e.message }, { status: 500 });
    if (e?.code === 11000) return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to update service." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin(); if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params; if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid service ID." }, { status: 400 });
  try {
    await connectDB(); const bookingCount = await Booking.countDocuments({ service: id, status: { $ne: "Cancelled" } });
    if (bookingCount) return NextResponse.json({ error: `Cannot delete this service because it has ${bookingCount} active/completed booking(s). Cancel or archive those bookings first.` }, { status: 409 });
    const service = await Service.findByIdAndDelete(id).lean(); if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    if (service.imagePublicId) await deleteCloudinaryImage(service.imagePublicId);
    return NextResponse.json({ ok: true, service });
  } catch (e) { console.error("ADMIN_SERVICE_DELETE_ERROR", e); return NextResponse.json({ error: "Unable to delete service." }, { status: 500 }); }
}
