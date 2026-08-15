import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import { requireAdmin } from "@/lib/auth";

const statuses = ["Booked", "Confirmed", "Assigned", "In Progress", "Completed", "Closed", "Cancelled"];
const paymentStatuses = ["Pending", "Partially Paid", "Paid", "Failed", "Refunded"];
const transactionMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Online", "Other"];

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid service call ID." }, { status: 400 });

  try {
    const body = await req.json();
    const update = {};

    if (body.status !== undefined) {
      if (!statuses.includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      update.status = body.status;
    }
    if (body.assignedProvider !== undefined) update.assignedProvider = String(body.assignedProvider).slice(0, 150);
    if (body.adminNotes !== undefined) update.adminNotes = String(body.adminNotes).slice(0, 2000);
    if (body.paymentAmount !== undefined) {
      const amount = Number(body.paymentAmount);
      if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: "Payment amount must be a valid non-negative number." }, { status: 400 });
      update.paymentAmount = Math.round(amount * 100) / 100;
    }
    if (body.paidAmount !== undefined) {
      const amount = Number(body.paidAmount);
      if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: "Paid amount must be a valid non-negative number." }, { status: 400 });
      update.paidAmount = Math.round(amount * 100) / 100;
    }
    if (body.transactionMethod !== undefined) {
      if (!transactionMethods.includes(body.transactionMethod)) return NextResponse.json({ error: "Invalid transaction method." }, { status: 400 });
      update.transactionMethod = body.transactionMethod;
    }
    if (body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(body.paymentStatus)) return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
      update.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "Paid") update.paidAt = new Date();
      if (["Pending", "Failed"].includes(body.paymentStatus)) update.paidAt = null;
    }
    if (body.transactionId !== undefined) update.transactionId = String(body.transactionId).slice(0, 150);
    if (body.paymentNotes !== undefined) update.paymentNotes = String(body.paymentNotes).slice(0, 1000);

    if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    await connectDB();
    const booking = await Booking.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate("user", "name email phone addressLine1 addressLine2 city state pincode country")
      .populate("service", "name category providerName address city image")
      .lean();

    if (!booking) return NextResponse.json({ error: "Service call not found." }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to update service call." }, { status: 500 });
  }
}
