const mongoose = require("mongoose");

const EditingTaskSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    collectedDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectedData",
      required: true,
    },
    serviceUnitId: { type: mongoose.Schema.Types.ObjectId, required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, required: true },
    packageName: { type: String, required: true },
    serviceName: { type: String, required: true },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorName: String,

    taskDescription: String,
    noOfPhotos: { type: Number, default: 0 },
    noOfVideos: { type: Number, default: 0 },

    assignedDate: { type: Date, default: Date.now },
    completionDate: { type: Date },

    // Status
    status: {
      type: String,
      enum: ["Assigned", "Completed"],
      default: "Assigned",
    },

    // ✅ NEW: Vendor submission tracking
    submittedDate: { type: Date },
    submittedNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EditingTask", EditingTaskSchema);
