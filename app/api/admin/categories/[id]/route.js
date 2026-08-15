import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Service from "@/models/Service";
import Provider from "@/models/Provider";
import { requireAdmin } from "@/lib/auth";

function slugify(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function normalize(body = {}) {
  const name = String(body.name || "").trim();
  return {
    name,
    slug: slugify(body.slug || name),
    icon: String(body.icon || "Sparkles").trim(),
    color: /^#[0-9a-f]{6}$/i.test(String(body.color || "")) ? String(body.color) : "#7045e8",
    description: String(body.description || "").trim().slice(0, 300),
    active: body.active !== false,
    order: Math.max(0, Number(body.order || 0) || 0)
  };
}

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });

  try {
    const data = normalize(await req.json());
    if (!data.name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    await connectDB();
    const existing = await Category.findById(id).lean();
    if (!existing) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (existing.name !== data.name) {
      await Promise.all([
        Service.updateMany({ category: existing.name }, { $set: { category: data.name } }),
        Provider.updateMany({ categories: existing.name }, { $set: { "categories.$": data.name } })
      ]);
    }
    return NextResponse.json({ category });
  } catch (e) {
    console.error("CATEGORY_UPDATE_ERROR", e);
    if (e?.code === 11000) return NextResponse.json({ error: "A category with this name or slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to update category." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });

  try {
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    const [serviceCount, providerCount] = await Promise.all([
      Service.countDocuments({ category: category.name }),
      Provider.countDocuments({ categories: category.name })
    ]);

    if (serviceCount || providerCount) {
      return NextResponse.json({
        error: `Cannot delete "${category.name}" because it is used by ${serviceCount} service(s) and ${providerCount} provider(s). Deactivate it instead or remove those references first.`
      }, { status: 409 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    console.error("CATEGORY_DELETE_ERROR", e);
    return NextResponse.json({ error: "Unable to delete category." }, { status: 500 });
  }
}
