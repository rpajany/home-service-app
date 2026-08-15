import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categories as demoCategories } from "@/lib/demo-data";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ categories: categories.length ? categories : demoCategories });
  } catch (e) {
    console.error("CATEGORY_LIST_ERROR", e);
    return NextResponse.json({ categories: demoCategories });
  }
}
