import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { demoServices } from "@/lib/demo-data";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") || "").trim();
  const exclude = (searchParams.get("exclude") || "").trim();
  const search = (searchParams.get("search") || "").trim();
  try {
    await connectDB();
    const query = {};
    if (category) query.category = { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
    if (exclude) query._id = { $ne: exclude };
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { providerName: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
    const services = await Service.find(query).sort({ createdAt: -1 }).lean();
    if (services.length || category || search) return NextResponse.json({ services });
    return NextResponse.json({ services: demoServices });
  } catch {
    let services = demoServices;
    if (category) services = services.filter(s => String(s.category).toLowerCase() === category.toLowerCase());
    if (exclude) services = services.filter(s => String(s._id) !== exclude);
    if (search) { const q = search.toLowerCase(); services = services.filter(s => `${s.name} ${s.category} ${s.providerName} ${s.address} ${s.city || ""} ${s.description || ""}`.toLowerCase().includes(q)); }
    return NextResponse.json({ services });
  }
}
