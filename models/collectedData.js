const mongoose = require("mongoose");

const EventDataSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Package ID
    eventName: { type: String, required: true },
    cameraName: { type: String },
    totalDriveSize: { type: String },
    filledSize: { type: String },
    copyingPerson: { type: String },
    copiedLocation: { type: String },
    noOfPhotos: { type: Number, default: 0 },
    noOfVideos: { type: Number, default: 0 },
    submissionDate: { type: Date },
    notes: { type: String },
    editingStatus: {
      type: String,
      enum: ["Pending", "In Process", "Completed"],
      default: "Pending", // Default when added
    },
  },
  { timestamps: true }
);

const CollectedDataSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    quotationUniqueId: { type: String, required: true },
    personName: { type: String, required: true },
    systemNumber: { type: String, required: true },
    immutableLock: { type: Boolean, default: false },
    events: [EventDataSchema],
    totalPhotos: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CollectedDataSchema.pre("save", function (next) {
  this.totalPhotos = this.events.reduce((sum, ev) => sum + (ev.noOfPhotos || 0), 0);
  this.totalVideos = this.events.reduce((sum, ev) => sum + (ev.noOfVideos || 0), 0);
  next();
});

module.exports = mongoose.model("CollectedData", CollectedDataSchema);
