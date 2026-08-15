import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["Booked", "Confirmed", "Assigned", "In Progress", "Completed", "Closed", "Cancelled"],
    default: "Booked"
  },
  assignedProvider: { type: String, default: "" },
  adminNotes: { type: String, default: "" },
  notes: { type: String, default: "" },
  customerAddress: {
    addressId: { type: mongoose.Schema.Types.ObjectId, default: null },
    label: { type: String, default: "Home" },
    customLabel: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
    gstNumber: { type: String, default: "" }
  },
  paymentAmount: { type: Number, default: 0, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  transactionMethod: { type: String, enum: ["Cash", "UPI", "Card", "Bank Transfer", "Online", "Other"], default: "Cash" },
  paymentStatus: { type: String, enum: ["Pending", "Partially Paid", "Paid", "Failed", "Refunded"], default: "Pending" },
  transactionId: { type: String, default: "" },
  paymentNotes: { type: String, default: "" },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ service: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $in: ["Booked", "Confirmed", "Assigned", "In Progress", "Completed"] } } });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
