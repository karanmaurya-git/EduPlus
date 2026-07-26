const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    settlementStatus: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIAL"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Fee", feeSchema);
