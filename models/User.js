import mongoose from "mongoose";

const serviceAddressSchema = new mongoose.Schema({
  label: { type: String, enum: ["Home", "Office", "Others"], required: true, trim: true },
  customLabel: { type: String, default: "", trim: true, maxlength: 50 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
  addressLine2: { type: String, default: "", trim: true, maxlength: 200 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  pincode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, default: "India", trim: true, maxlength: 100 },
  gstNumber: { type: String, default: "", trim: true, maxlength: 30 },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  // Legacy single-address fields are retained for backwards compatibility.
  addressLine1: { type: String, default: "", trim: true },
  addressLine2: { type: String, default: "", trim: true },
  city: { type: String, default: "", trim: true },
  state: { type: String, default: "", trim: true },
  pincode: { type: String, default: "", trim: true },
  country: { type: String, default: "India", trim: true },
  serviceAddresses: { type: [serviceAddressSchema], default: [] },
  passwordHash: { type: String, default: "" },
  oauthProviders: { type: [String], default: [] },
  role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
