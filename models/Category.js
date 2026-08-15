import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, unique: true, index: true, trim: true, maxlength: 80 },
  icon: { type: String, default: "Sparkles", trim: true },
  color: { type: String, default: "#7045e8", trim: true },
  description: { type: String, default: "", trim: true, maxlength: 300 },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
