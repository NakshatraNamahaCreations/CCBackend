const mongoose = require("mongoose");

const SortedUnitSchema = new mongoose.Schema(
  {
    serviceUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    packageName: { type: String, required: true },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    serviceName: { type: String, required: true },

    unitIndex: { type: Number, required: true },

    // --- Sorted counts ---
    sortedPhotos: {
      type: Number,
      default: 0,
      min: 0,
    },
    sortedVideos: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const SortedDataSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    quotationUniqueId: {
      type: String,
      required: true, // ✅ store it directly
    },
    collectedDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectedData",
      required: true,
    },

    // All sorted services
    serviceUnits: [SortedUnitSchema],

    // Overall totals
    totalSortedPhotos: {
      type: Number,
      default: 0,
    },
    totalSortedVideos: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔥 Auto-calc totals before save
SortedDataSchema.pre("save", function (next) {
  let photoSum = 0;
  let videoSum = 0;

  this.serviceUnits.forEach((u) => {
    photoSum += u.sortedPhotos || 0;
    videoSum += u.sortedVideos || 0;
  });

  this.totalSortedPhotos = photoSum;
  this.totalSortedVideos = videoSum;

  next();
});

module.exports = mongoose.model("SortedData", SortedDataSchema);
