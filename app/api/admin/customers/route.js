import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

function serializeAddress(address) {
  return { id: String(address._id), label: address.label || "Home", customLabel: address.customLabel || "", addressLine1: address.addressLine1 || "", addressLine2: address.addressLine2 || "", city: address.city || "", state: address.state || "", pincode: address.pincode || "", country: address.country || "India", gstNumber: address.gstNumber || "", isDefault: Boolean(address.isDefault) };
}
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    await connectDB();
    const users = await User.find({ role: "customer" }).select("name email phone serviceAddresses addressLine1 addressLine2 city state pincode country").sort({ name: 1 }).lean();
    const customers = users.map(user => {
      let addresses = (user.serviceAddresses || []).map(serializeAddress);
      if (!addresses.length && user.addressLine1 && user.city && user.state && user.pincode) addresses = [{ id: null, label: "Home", customLabel: "", addressLine1: user.addressLine1, addressLine2: user.addressLine2 || "", city: user.city, state: user.state, pincode: user.pincode, country: user.country || "India", gstNumber: "", isDefault: true }];
      return { id: String(user._id), name: user.name, email: user.email, phone: user.phone || "", serviceAddresses: addresses };
    });
    return NextResponse.json({ customers });
  } catch (e) { console.error("ADMIN_CUSTOMERS_LIST_ERROR", e); return NextResponse.json({ error: "Unable to load customers." }, { status: 500 }); }
}


export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const address = body.address || {};
    const label = ["Home", "Office", "Others"].includes(String(address.label)) ? String(address.label) : "Home";
    const customLabel = String(address.customLabel || "").trim().slice(0, 50);
    const addressLine1 = String(address.addressLine1 || "").trim();
    const addressLine2 = String(address.addressLine2 || "").trim();
    const city = String(address.city || "").trim();
    const state = String(address.state || "").trim();
    const pincode = String(address.pincode || "").trim();
    const country = String(address.country || "India").trim() || "India";
    const gstNumber = String(address.gstNumber || "").trim().toUpperCase().slice(0, 30);
    if (!name || !email || !addressLine1 || !city || !state || !pincode) return NextResponse.json({ error: "Name, email and Address Line 1, City, State and PIN Code are required." }, { status: 400 });
    if (label === "Others" && !customLabel) return NextResponse.json({ error: "Custom name is required for Others address." }, { status: 400 });
    await connectDB();
    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ error: "A customer with this email already exists." }, { status: 409 });
    const customer = await User.create({ name, email, phone, role: "customer", serviceAddresses: [{ label, customLabel, addressLine1, addressLine2, city, state, pincode, country, gstNumber, isDefault: true }], addressLine1, addressLine2, city, state, pincode, country });
    const a = customer.serviceAddresses[0];
    return NextResponse.json({ customer: { id: String(customer._id), name: customer.name, email: customer.email, phone: customer.phone || "", serviceAddresses: [serializeAddress(a)] } }, { status: 201 });
  } catch (e) {
    console.error("ADMIN_CUSTOMER_CREATE_ERROR", e);
    if (e?.code === 11000) return NextResponse.json({ error: "A customer with this email already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create customer." }, { status: 500 });
  }
}
