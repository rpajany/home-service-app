import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { demoServices } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    await connectDB();
    const bookings = await Booking.find({ user: session.userId })
      .populate("service")
      .sort({ date: 1, time: 1 })
      .lean();
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to load bookings." }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  try {
    const { serviceId, date, time, notes = "", addressId = "" } = await req.json();
    if (!serviceId || !date || !time) {
      return NextResponse.json({ error: "Service, date and time are required." }, { status: 400 });
    }

    const selectedDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      return NextResponse.json({ error: "Please select today or a future date." }, { status: 400 });
    }

    await connectDB();

    // The UI may contain a demo slug/legacy id when the services API falls
    // back to demo data. Never pass that string directly to findById().
    let service = null;
    if (mongoose.isValidObjectId(serviceId)) {
      service = await Service.findById(serviceId);
    } else {
      const legacyDemo = demoServices.find(s => s._id === serviceId || s.slug === serviceId);
      if (legacyDemo) {
        // Also support databases created by the previous version, which did
        // not have a slug field.
        service = await Service.findOne({
          $or: [
            { slug: legacyDemo.slug },
            { name: legacyDemo.name }
          ]
        });
      } else {
        service = await Service.findOne({
          $or: [{ slug: serviceId }, { name: serviceId }]
        });
      }
    }

    if (!service) {
      return NextResponse.json({ error: "Service not found. Please run npm run seed and try again." }, { status: 404 });
    }

    if (!service.slots.includes(time)) {
      return NextResponse.json({ error: "The selected time slot is not available for this service." }, { status: 400 });
    }

    const exists = await Booking.findOne({
      service: service._id,
      date,
      time,
      status: { $ne: "Cancelled" }
    });
    if (exists) {
      return NextResponse.json({ error: "That time slot is already booked. Please choose another slot." }, { status: 409 });
    }

    const user = await User.findById(session.userId).lean();
    if (!user) return NextResponse.json({ error: "Customer account not found." }, { status: 404 });

    let addresses = Array.isArray(user.serviceAddresses) ? user.serviceAddresses : [];
    // Migrate/recognize the old single address when no multi-address data exists.
    if (!addresses.length && user.addressLine1 && user.city && user.state && user.pincode) {
      addresses = [{
        _id: null,
        label: "Home",
        customLabel: "",
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2 || "",
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country || "India",
        isDefault: true
      }];
    }
    if (!addresses.length) {
      return NextResponse.json({ error: "Please add a service address in Profile before booking." }, { status: 400 });
    }

    let selectedAddress = null;
    if (addressId) {
      selectedAddress = addresses.find(a => String(a._id) === String(addressId));
    } else if (addresses.length === 1) {
      selectedAddress = addresses[0];
    }
    if (!selectedAddress) {
      return NextResponse.json({ error: "Please select a service address for this booking." }, { status: 400 });
    }

    const customerAddress = {
      addressId: selectedAddress._id || null,
      label: selectedAddress.label || "Home",
      customLabel: selectedAddress.customLabel || "",
      addressLine1: selectedAddress.addressLine1 || "",
      addressLine2: selectedAddress.addressLine2 || "",
      city: selectedAddress.city || "",
      state: selectedAddress.state || "",
      pincode: selectedAddress.pincode || "",
      country: selectedAddress.country || "India",
      gstNumber: selectedAddress.gstNumber || ""
    };
    if (!customerAddress.addressLine1 || !customerAddress.city || !customerAddress.state || !customerAddress.pincode) {
      return NextResponse.json({ error: "The selected service address is incomplete. Please edit it in Profile." }, { status: 400 });
    }

    const booking = await Booking.create({
      user: session.userId,
      customerAddress,
      service: service._id,
      date,
      time,
      notes: String(notes).slice(0, 1000)
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error("BOOKING_CREATE_ERROR", e);
    if (e?.code === 11000) {
      return NextResponse.json({ error: "That time slot was just booked by another customer. Please choose another slot." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create booking. Please check your MongoDB connection and try again." }, { status: 500 });
  }
}
