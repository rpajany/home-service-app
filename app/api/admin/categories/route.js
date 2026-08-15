import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
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

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    await connectDB();
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("ADMIN_CATEGORY_LIST_ERROR", e);
    return NextResponse.json({ error: "Unable to load categories." }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const data = normalize(await req.json());
    if (!data.name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    if (!data.slug) return NextResponse.json({ error: "A valid category slug could not be generated." }, { status: 400 });

    await connectDB();
    const category = await Category.create(data);
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    console.error("CATEGORY_CREATE_ERROR", e);
    if (e?.code === 11000) return NextResponse.json({ error: "A category with this name or slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create category." }, { status: 500 });
  }
}
