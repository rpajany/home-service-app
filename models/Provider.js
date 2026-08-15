import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true, lowercase: true },
  categories: { type: [String], default: [] },
  address: { type: String, default: "", trim: true },
  city: { type: String, default: "", trim: true },
  status: { type: String, enum: ["Available", "Busy", "Inactive"], default: "Available" },
  experience: { type: Number, min: 0, default: 0 },
  notes: { type: String, default: "", trim: true }
}, { timestamps: true });

providerSchema.index({ name: 1 });
providerSchema.index({ status: 1 });

export default mongoose.models.Provider || mongoose.model("Provider", providerSchema);
