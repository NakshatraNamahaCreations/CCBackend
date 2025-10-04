// const mongoose = require("mongoose");

// const DailyAssignmentSchema = new mongoose.Schema(
//   {
//     serviceName: { type: String, required: true },
//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//     },
//     vendorName: { type: String, required: true },
//     taskDate: { type: Date, default: Date.now },
//     taskDescription: { type: String, default: "" },
//     completionDate: { type: Date, required: true },
//     photosAssigned: { type: Number, default: 0 },
//     videosAssigned: { type: Number, default: 0 },
//     status: {
//       type: String,
//       enum: ["InProgress", "Completed"],
//       default: "InProgress",
//     },
//   },

// );

// const AssignedTaskSchema = new mongoose.Schema(
//   {
//     quotationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Quotation",
//       required: true,
//     },
//     eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     eventName: { type: String, required: true },

//     totalPhotos: { type: Number, default: 0 },
//     totalVideos: { type: Number, default: 0 },
//     assignedPhotos: { type: Number, default: 0 },
//     assignedVideos: { type: Number, default: 0 },
//     remainingPhotosToAssign: { type: Number, default: 0 },
//     remainingVideosToAssign: { type: Number, default: 0 },
//     photosEdited: { type: Number, default: 0 },
//     videosEdited: { type: Number, default: 0 },

//     assignments: { type: [DailyAssignmentSchema], default: [] },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("AssignedTask", AssignedTaskSchema);

// models/Task.js
const mongoose = require("mongoose");

const AssignedTaskSchema = new mongoose.Schema(
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

    taskType: {
      type: String,
      enum: ["PhotoSorting", "VideoConversion", "Both"],
      required: true,
    },
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

module.exports = mongoose.model("AssignedTask", AssignedTaskSchema);
