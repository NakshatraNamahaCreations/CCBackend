// const mongoose = require("mongoose");

// const EventDataSchema = new mongoose.Schema(
//   {
//     eventId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Package ID
//     eventName: { type: String, required: true },
//     cameraName: { type: String },
//     totalDriveSize: { type: String },
//     filledSize: { type: String },
//     copyingPerson: { type: String },
//     copiedLocation: { type: String },
//     noOfPhotos: { type: Number, default: 0 },
//     noOfVideos: { type: Number, default: 0 },
//     submissionDate: { type: Date },
//     notes: { type: String },
//     editingStatus: {
//       type: String,

//       default: "Pending",
//     },
//   },
//   { timestamps: true }
// );

// const CollectedDataSchema = new mongoose.Schema(
//   {
//     quotationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Quotation",
//       required: true,
//     },
//     quotationUniqueId: { type: String, required: true },
//     personName: { type: String, required: true },
//     systemNumber: { type: String, required: true },
//     immutableLock: { type: Boolean, default: false },
//     events: [EventDataSchema],
//     totalPhotos: { type: Number, default: 0 },
//     totalVideos: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// CollectedDataSchema.pre("save", function (next) {
//   this.totalPhotos = this.events.reduce((sum, ev) => sum + (ev.noOfPhotos || 0), 0);
//   this.totalVideos = this.events.reduce((sum, ev) => sum + (ev.noOfVideos || 0), 0);
//   next();
// });

// module.exports = mongoose.model("CollectedData", CollectedDataSchema);

const mongoose = require("mongoose");

const ServiceUnitDataSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, required: true },
    packageName: { type: String, required: true },

    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    serviceName: { type: String, required: true },

    unitIndex: { type: Number, required: true, min: 0 },

    cameraName: { type: String },
    totalDriveSize: { type: String },

    backupDrive: { type: String },
    driveName: { type: String },
    qualityChecked: { type: Boolean, default: false },

    filledSize: { type: String },
    copyingPerson: { type: String },
    copiedLocation: { type: String },
    backupCopiedLocation: { type: String },

    noOfPhotos: { type: Number, default: 0 },
    noOfVideos: { type: Number, default: 0 },

    // ✅ NEW fields matching frontend
    firstPhotoTime: { type: String },
    lastPhotoTime: { type: String },
    firstVideoTime: { type: String },
    lastVideoTime: { type: String },

    submissionDate: { type: Date },
    notes: { type: String },

    sortingStatus: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

// Ensure one doc per (package, service, unit)
ServiceUnitDataSchema.index(
  { packageId: 1, serviceId: 1, unitIndex: 1 },
  { unique: true }
);

const CollectedDataSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    quotationUniqueId: { type: String, required: true },

    // Renamed in UI: Couples / Person Name
    personName: { type: String, required: true },

    systemNumber: { type: String, required: true },
    backupSystemNumber: { type: String },
    immutableLock: { type: Boolean, default: false },

    // Service-unit-wise collection (replaces events)
    serviceUnits: [ServiceUnitDataSchema],

    totalPhotos: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calc totals
CollectedDataSchema.pre("save", function (next) {
  const units = this.serviceUnits || [];
  this.totalPhotos = units.reduce((sum, su) => sum + (su.noOfPhotos || 0), 0);
  this.totalVideos = units.reduce((sum, su) => sum + (su.noOfVideos || 0), 0);
  next();
});

module.exports = mongoose.model("CollectedData", CollectedDataSchema);
