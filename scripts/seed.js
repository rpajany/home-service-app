const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, phone: String, passwordHash: String, role: String }, { timestamps: true });
const serviceSchema = new mongoose.Schema({ slug: { type: String, unique: true, index: true }, name: String, category: String, providerName: String, address: String, city: String, email: String, description: String, image: String, gallery: [String], rating: Number, reviews: Number, availableFrom: String, availableTo: String, slots: [String] }, { timestamps: true });
const providerSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, phone: String, email: String, categories: [String], address: String, city: String, status: { type: String, enum: ["Available", "Busy", "Inactive"], default: "Available" }, experience: { type: Number, default: 0 }, notes: String }, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
const Provider = mongoose.models.Provider || mongoose.model("Provider", providerSchema);
const categorySchema = new mongoose.Schema({ name: { type: String, unique: true, trim: true }, slug: { type: String, unique: true, index: true }, icon: String, color: String, description: String, active: Boolean, order: Number }, { timestamps: true });
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const categories = [
  { name: "Cleaning", slug: "cleaning", icon: "Sparkles", color: "#8b45df", description: "Home and office cleaning services.", active: true, order: 1 },
  { name: "Repair", slug: "repair", icon: "Wrench", color: "#e5aa00", description: "General home repair and maintenance.", active: true, order: 2 },
  { name: "Painting", slug: "painting", icon: "Paintbrush", color: "#0eaaa5", description: "Interior and exterior painting services.", active: true, order: 3 },
  { name: "Shifting", slug: "shifting", icon: "Truck", color: "#e44848", description: "Moving and shifting assistance.", active: true, order: 4 },
  { name: "Plumbing", slug: "plumbing", icon: "Pipette", color: "#f39a14", description: "Plumbing installation and repair.", active: true, order: 5 },
  { name: "Electric", slug: "electric", icon: "Zap", color: "#1472c9", description: "Electrical installation and repair.", active: true, order: 6 }
];

const providers = [
  { name: "Jenny Wilson", phone: "+1 212 555 0101", email: "jenny@example.com", categories: ["Cleaning"], address: "255 Grand Park Ave", city: "New York", status: "Available", experience: 5 },
  { name: "Emma Potter", phone: "+1 212 555 0102", email: "emma@example.com", categories: ["Cleaning"], address: "525 N Tyron Street", city: "New York", status: "Available", experience: 4 },
  { name: "Henny Wilson", phone: "+1 704 555 0103", email: "henny@example.com", categories: ["Cleaning"], address: "525 N Tryon Street", city: "Charlotte", status: "Available", experience: 6 },
  { name: "Harry Will", phone: "+1 704 555 0104", email: "harry@example.com", categories: ["Cleaning"], address: "Kallie Loop", city: "Charlotte", status: "Available", experience: 3 },
  { name: "Raj Kumar", phone: "+91 98765 43210", email: "raj@example.com", categories: ["Plumbing", "Electric"], address: "Main Street", city: "New York", status: "Available", experience: 8 }
];

const services = [
  { slug: "house-cleaning", name: "House Cleaning", category: "Cleaning", providerName: "Jenny Wilson", address: "255 Grand Park Ave, New York", city: "New York", email: "accounts@tubeguruji.com", image: "/images/house-cleaning.jpg", description: "Professional home cleaning for kitchens, bedrooms, bathrooms and living areas. Our trained cleaners arrive with supplies and follow a room-by-room checklist.", rating: 4.9, reviews: 214, availableFrom: "08:00", availableTo: "22:00", slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { slug: "washing-clothes", name: "Washing Clothes", category: "Cleaning", providerName: "Emma Potter", address: "525 N Tyron Street, New York", city: "New York", image: "/images/washing-clothes.jpg", description: "Convenient laundry pickup and cleaning service for everyday clothes, linens and delicate garments.", rating: 4.8, reviews: 178, availableFrom: "09:00", availableTo: "20:00", slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "14:00", "15:30", "17:00"] },
  { slug: "bathroom-cleaning", name: "Bathroom Cleaning", category: "Cleaning", providerName: "Henny Wilson", address: "525 N Tryon Street, NC", city: "Charlotte", image: "/images/bathroom-cleaning.jpg", description: "Deep bathroom cleaning including tiles, fixtures, mirrors, floors and hard-to-reach areas.", rating: 4.7, reviews: 142, availableFrom: "08:00", availableTo: "21:00", slots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"] },
  { slug: "floor-cleaning", name: "Floor Cleaning", category: "Cleaning", providerName: "Harry Will", address: "Kallie Loop, NC", city: "Charlotte", image: "/images/floor-cleaning.jpg", description: "Floor cleaning and polishing for tile, wood and other common household surfaces.", rating: 4.6, reviews: 97, availableFrom: "08:00", availableTo: "20:00", slots: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"] }
];

(async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env.local");
  await mongoose.connect(process.env.MONGODB_URI);
  await Service.deleteMany({});
  try { await mongoose.connection.collection("bookings").dropIndex("service_1_date_1_time_1"); } catch {}
  await Service.insertMany(services);
  await Category.deleteMany({});
  await Category.insertMany(categories);
  await Provider.deleteMany({});
  await Provider.insertMany(providers);

  const customerHash = await bcrypt.hash("password123", 12);
  await User.updateOne({ email: "demo@example.com" }, { name: "Demo User", email: "demo@example.com", passwordHash: customerHash, role: "customer" }, { upsert: true });

  const adminHash = await bcrypt.hash("Admin@12345", 12);
  await User.updateOne({ email: "admin@example.com" }, { name: "System Admin", email: "admin@example.com", passwordHash: adminHash, role: "admin" }, { upsert: true });

  console.log("Seed complete.");
  console.log("Customer: demo@example.com / password123");
  console.log("Admin:    admin@example.com / Admin@12345");
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
