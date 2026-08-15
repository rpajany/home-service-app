import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categories as demoCategories } from "@/lib/demo-data";

export async function getActiveCategories() {
  try {
    await connectDB();
    const categories = await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean();
    return categories.length ? categories : demoCategories;
  } catch {
    return demoCategories;
  }
}
