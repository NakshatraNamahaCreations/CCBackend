const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, unique: true },
    persons: [
      {
        name: { type: String },
        phoneNo: { type: String },
        whatsappNo: { type: String },
        email: { type: String },
        profession: { type: String },
        instaHandle: { type: String },
      },
    ],
    referenceForm: { type: String },

    queries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Query",
      },
    ],
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
module.exports = Lead;
