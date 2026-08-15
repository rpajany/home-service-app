import mongoose from "mongoose";
const companySchema = new mongoose.Schema({
  name: { type: String, default: "Logoipsum Home Services", trim: true, maxlength: 150 },
  logo: { type: String, default: "" },
  logoPublicId: { type: String, default: "" },
  address: { type: String, default: "", trim: true, maxlength: 500 },
  phone: { type: String, default: "", trim: true, maxlength: 50 },
  email: { type: String, default: "", trim: true, lowercase: true, maxlength: 150 },
  gst: { type: String, default: "", trim: true, maxlength: 30 },
  website: { type: String, default: "", trim: true, maxlength: 250 },
  tagline: { type: String, default: "Trusted home services, simple booking.", trim: true, maxlength: 250 },
  footerText: { type: String, default: "", trim: true, maxlength: 500 }
}, { timestamps: true });
export default mongoose.models.Company || mongoose.model("Company", companySchema);
