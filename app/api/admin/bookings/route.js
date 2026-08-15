import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    await connectDB();
    const bookings = await Booking.find()
      .populate("user", "name email phone addressLine1 addressLine2 city state pincode country")
      .populate("service", "name category providerName address city image")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to load service calls." }, { status: 500 });
  }
}
