import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { demoServices } from "@/lib/demo-data";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { slug: id };
    const service = await Service.findOne(query).lean();
    if (service) return NextResponse.json({ service });
  } catch (e) {
    console.error("SERVICE_GET_ERROR", e);
  }

  const service = demoServices.find(s => s._id === id || s.slug === id);
  if (service) return NextResponse.json({ service });
  return NextResponse.json({ error: "Service not found" }, { status: 404 });
}
