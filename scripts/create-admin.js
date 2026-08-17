// scripts/create-admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);

  const email = "admin@example.com";
  const password = "Admin@12345";

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name: "System Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created successfully");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});

// node scripts/create-admin.js