import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Service from "@/models/Service";
import { requireAdmin } from "@/lib/auth";

const paymentStatuses = ["Pending", "Partially Paid", "Paid", "Failed", "Refunded"];
const transactionMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Online", "Other"];
function snapshotAddress(address) { return { addressId: mongoose.isValidObjectId(address?._id || address?.id) ? (address._id || address.id) : null, label: address?.label || "Home", customLabel: address?.customLabel || "", addressLine1: address?.addressLine1 || "", addressLine2: address?.addressLine2 || "", city: address?.city || "", state: address?.state || "", pincode: address?.pincode || "", country: address?.country || "India", gstNumber: address?.gstNumber || "" }; }

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await req.json();
    const { customerId, serviceId, addressId, date, time, notes = "", paymentAmount = 0, paidAmount = 0, transactionMethod = "Cash", paymentStatus = "Pending", transactionId = "", paymentNotes = "" } = body;
    if (!customerId || !serviceId || !date || !time) return NextResponse.json({ error: "Customer, service, date and time are required." }, { status: 400 });
    if (!mongoose.isValidObjectId(customerId) || !mongoose.isValidObjectId(serviceId)) return NextResponse.json({ error: "Invalid customer or service." }, { status: 400 });
    const selectedDate = new Date(`${date}T00:00:00`); const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) return NextResponse.json({ error: "Please select today or a future date." }, { status: 400 });
    const amount = Number(paymentAmount); const paid = Number(paidAmount);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(paid) || paid < 0) return NextResponse.json({ error: "Payment amounts must be valid non-negative numbers." }, { status: 400 });
    if (paid > amount) return NextResponse.json({ error: "Paid amount cannot be greater than the payment amount." }, { status: 400 });
    if (!paymentStatuses.includes(paymentStatus)) return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    if (!transactionMethods.includes(transactionMethod)) return NextResponse.json({ error: "Invalid transaction method." }, { status: 400 });
    await connectDB();
    const [customer, service] = await Promise.all([User.findOne({ _id: customerId, role: "customer" }), Service.findById(serviceId)]);
    if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    if (!service.slots.includes(time)) return NextResponse.json({ error: "The selected time slot is not available for this service." }, { status: 400 });
    const exists = await Booking.findOne({ service: service._id, date, time, status: { $ne: "Cancelled" } });
    if (exists) return NextResponse.json({ error: "That time slot is already booked. Please choose another slot." }, { status: 409 });
    const addresses = Array.isArray(customer.serviceAddresses) ? customer.serviceAddresses : [];
    let address = addressId ? addresses.find(a => String(a._id) === String(addressId)) : null;
    if (!address && addresses.length === 1) address = addresses[0];
    if (!address && customer.addressLine1 && customer.city && customer.state && customer.pincode) address = { label: "Home", addressLine1: customer.addressLine1, addressLine2: customer.addressLine2, city: customer.city, state: customer.state, pincode: customer.pincode, country: customer.country };
    if (!address) return NextResponse.json({ error: "This customer has no complete service address. Add an address to the customer's profile first." }, { status: 400 });
    const booking = await Booking.create({ user: customer._id, service: service._id, customerAddress: snapshotAddress(address), date, time, notes: String(notes).slice(0, 1000), paymentAmount: Math.round(amount * 100) / 100, paidAmount: Math.round(paid * 100) / 100, transactionMethod, paymentStatus, transactionId: String(transactionId).slice(0, 150), paymentNotes: String(paymentNotes).slice(0, 1000), paidAt: paymentStatus === "Paid" ? new Date() : null });
    const populated = await Booking.findById(booking._id).populate("user", "name email phone addressLine1 addressLine2 city state pincode country").populate("service", "name category providerName address city image").lean();
    return NextResponse.json({ booking: populated }, { status: 201 });
  } catch (e) {
    console.error("ADMIN_BOOKING_CREATE_ERROR", e);
    if (e?.code === 11000) return NextResponse.json({ error: "That time slot was just booked. Please choose another slot." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
  }
}
