// models/albumPhotoSelectionTask.js
const mongoose = require("mongoose");

const AlbumPhotoSelectionTaskSchema = new mongoose.Schema({
  quotationId: {
    type: String,
    required: true
  },
  albumId: {
    type: String,
    required: true
  },
  templateLabel: {
    type: String,
    required: true
  },
  baseSheets: {
    type: Number,
    required: true
  },
  basePhotos: {
    type: Number,
    required: true
  },
  vendorId: {
    type: String,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  taskDescription: {
    type: String,
    default: ""
  },
  assignedDate: {
    type: Date,
    required: true
  },
  photosToSelect: {
    type: Number,
    required: true
  },
  // status: {
  //   type: String,
  //   enum: ["Assigned", "In Progress", "Completed"],
  //   default: "Assigned"
  // },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AlbumPhotoSelectionTask", AlbumPhotoSelectionTaskSchema);