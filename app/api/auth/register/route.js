import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password || password.length < 6) return NextResponse.json({ error: "Name, email and a password of at least 6 characters are required." }, { status: 400 });
    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    await createSession(user);
    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Unable to create account." }, { status: 500 }); }
}
