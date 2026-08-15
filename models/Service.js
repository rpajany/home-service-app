import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  providerName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: "New York" },
  email: { type: String, default: "" },
  description: { type: String, default: "" },
  image: { type: String, required: true },
  imagePublicId: { type: String, default: "" },
  gallery: { type: [String], default: [] },
  rating: { type: Number, default: 4.8 },
  reviews: { type: Number, default: 120 },
  availableFrom: { type: String, default: "08:00" },
  availableTo: { type: String, default: "22:00" },
  slots: { type: [String], default: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "15:00", "16:00", "17:00"] }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model("Service", serviceSchema);
