const mongoose = require("mongoose");


const SubmissionDetailSchema = new mongoose.Schema(
  {
    submissionDate: { type: Date, default: Date.now },
    photosEdited: { type: Number, default: 0 },
    videosEdited: { type: Number, default: 0 },
    comment: { type: String, default: "" },
  },
  { _id: false }
);

const VendorSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignedTask",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorName: { type: String, required: true },

    // Array of submissions
    submissions: { type: [SubmissionDetailSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorSubmission", VendorSubmissionSchema);
