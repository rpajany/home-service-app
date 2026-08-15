import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    await createSession(user);
    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Unable to sign in." }, { status: 500 }); }
}
