const mongoose = require("mongoose");

const AlbumEditingTaskSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // snapshot of album at assignment time (so later changes don't break context)
    albumSnapshot: {
      templateLabel: String,
      baseSheets: Number,
      basePhotos: Number,
      boxLabel: String,
      qty: Number,
      unitPrice: Number,
    },

    selectedPhotos: { type: Number, default: 0 },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorName: { type: String, default: "" },
    taskDescription: { type: String, default: "" },
    // lifecycle
    status: {
      type: String,
      enum: ["Assigned", "Submitted", "Sent for Printing", "Completed"],
      default: "Assigned",
      index: true,
    },
    assignedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlbumEditingTask", AlbumEditingTaskSchema);
