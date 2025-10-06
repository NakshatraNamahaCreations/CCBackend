const mongoose = require("mongoose");

const SortingAssignedTaskSchema = new mongoose.Schema(
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
    submittedPhotos: { type: Number, default: 0 },
    submittedVideos: { type: Number, default: 0 },
    submittedNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SortingAssignedTask",
  SortingAssignedTaskSchema
);
