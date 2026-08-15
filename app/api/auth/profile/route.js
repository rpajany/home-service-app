import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession, getSession } from "@/lib/auth";

const LABELS = ["Home", "Office", "Others"];

function serializeAddress(address) {
  return {
    id: String(address._id),
    label: address.label || "Home",
    customLabel: address.customLabel || "",
    addressLine1: address.addressLine1 || "",
    addressLine2: address.addressLine2 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    country: address.country || "India",
    gstNumber: address.gstNumber || "",
    isDefault: Boolean(address.isDefault)
  };
}

function legacyAddress(user) {
  const complete = user.addressLine1 && user.city && user.state && user.pincode;
  if (!complete) return null;
  return {
    id: null,
    label: "Home",
    customLabel: "",
    addressLine1: user.addressLine1 || "",
    addressLine2: user.addressLine2 || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
    country: user.country || "India",
    gstNumber: "",
    isDefault: true
  };
}

function normalizeAddresses(input) {
  if (!Array.isArray(input)) return null;
  if (input.length > 20) throw new Error("You can save up to 20 service addresses.");

  const result = input.map((item) => {
    const label = String(item?.label || "Others").trim();
    if (!LABELS.includes(label)) throw new Error("Invalid address label.");
    const addressLine1 = String(item?.addressLine1 || "").trim().slice(0, 200);
    const city = String(item?.city || "").trim().slice(0, 100);
    const state = String(item?.state || "").trim().slice(0, 100);
    const pincode = String(item?.pincode || "").trim().slice(0, 20);
    if (!addressLine1 || !city || !state || !pincode) {
      throw new Error(`${label} address requires Address Line 1, City, State and PIN Code.`);
    }

    const rawId = String(item?._id || item?.id || "");
    const data = {
      label,
      customLabel: String(item?.customLabel || "").trim().slice(0, 50),
      addressLine1,
      addressLine2: String(item?.addressLine2 || "").trim().slice(0, 200),
      city,
      state,
      pincode,
      country: String(item?.country || "India").trim().slice(0, 100) || "India",
      gstNumber: String(item?.gstNumber || "").trim().slice(0, 30).toUpperCase(),
      isDefault: Boolean(item?.isDefault)
    };
    if (mongoose.isValidObjectId(rawId)) data._id = rawId;
    return data;
  });

  // Exactly one default address. If none is selected, make the first one default.
  let defaultSeen = false;
  result.forEach((address) => {
    if (address.isDefault && !defaultSeen) defaultSeen = true;
    else address.isDefault = false;
  });
  if (result.length && !defaultSeen) result[0].isDefault = true;
  return result;
}

function responseUser(user) {
  let addresses = (user.serviceAddresses || []).map(serializeAddress);
  if (!addresses.length) {
    const legacy = legacyAddress(user);
    if (legacy) addresses = [legacy];
  }
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    serviceAddresses: addresses,
    // Keep these fields for old UI/API consumers.
    addressLine1: user.addressLine1 || addresses[0]?.addressLine1 || "",
    addressLine2: user.addressLine2 || addresses[0]?.addressLine2 || "",
    city: user.city || addresses[0]?.city || "",
    state: user.state || addresses[0]?.state || "",
    pincode: user.pincode || addresses[0]?.pincode || "",
    country: user.country || addresses[0]?.country || "India",
    createdAt: user.createdAt
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    await connectDB();
    const user = await User.findById(session.userId).lean();
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: responseUser(user) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    await connectDB();
    const current = await User.findById(session.userId);
    if (!current) return NextResponse.json({ error: "User not found." }, { status: 404 });

    let addresses = null;
    if (Array.isArray(body.serviceAddresses)) {
      addresses = normalizeAddresses(body.serviceAddresses);
    } else {
      // Backwards compatibility with the previous single-address profile form.
      const legacy = {
        label: "Home",
        addressLine1: String(body.addressLine1 || "").trim(),
        addressLine2: String(body.addressLine2 || "").trim(),
        city: String(body.city || "").trim(),
        state: String(body.state || "").trim(),
        pincode: String(body.pincode || "").trim(),
        country: String(body.country || "India").trim() || "India",
        isDefault: true
      };
      if (legacy.addressLine1 || legacy.city || legacy.state || legacy.pincode) {
        addresses = normalizeAddresses([legacy]);
      } else {
        addresses = current.serviceAddresses || [];
      }
    }

    current.name = name;
    current.phone = phone;
    current.serviceAddresses = addresses;

    // Keep the old address fields synchronized with the default address for
    // existing admin/report code and older bookings.
    const defaultAddress = current.serviceAddresses.find(a => a.isDefault) || current.serviceAddresses[0];
    current.addressLine1 = defaultAddress?.addressLine1 || "";
    current.addressLine2 = defaultAddress?.addressLine2 || "";
    current.city = defaultAddress?.city || "";
    current.state = defaultAddress?.state || "";
    current.pincode = defaultAddress?.pincode || "";
    current.country = defaultAddress?.country || "India";

    await current.save();
    await createSession(current);
    return NextResponse.json({ user: responseUser(current.toObject()) });
  } catch (e) {
    console.error("PROFILE_UPDATE_ERROR", e);
    return NextResponse.json({ error: e?.message || "Unable to update profile." }, { status: 400 });
  }
}
