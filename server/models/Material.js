const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetClass: { type: String, required: true },
    section: { type: String, default: "All Sections" },
    category: {
      type: String,
      enum: ["STUDY MATERIAL", "PAPER", "HOMEWORK"],
      required: true,
    },
    subject: { type: String, required: true },
    link: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
