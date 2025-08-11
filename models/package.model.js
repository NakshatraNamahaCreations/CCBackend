// // models/package.model.js

// const mongoose = require('mongoose');

// const serviceSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   serviceName: { type: String, required: true },
//   price: { type: Number, required: true, default: 0 },
//   qty: { type: String, required: true, default: '1' },
// });

// const packageSchema = new mongoose.Schema({
//   packageName: { type: String, required: true },
//   services: [serviceSchema],
//   date: { type: String }, // stored as "DD/MM/YYYY" string, same as frontend
//   timeSlot: { type: String },
//   venueName: { type: String },
//   venueAddress: { type: String },
//   totalAmount: { type: Number, default: 0 },
//   isPreset: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Package', packageSchema);

const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  price: { type: Number },        // Base price for the customer
  marginPrice: { type: Number },  // Internal/vendor cost or profit margin basis
  qty: { type: String },          // Quantity (as string for compatibility with UI)
});

const packageSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },
    packageName: { type: String, required: true },
    services: [serviceSchema],
    timeSlot: { type: String },
    venueName: { type: String },
    venueAddress: { type: String },
    eventStartDate: { type: String }, // store in "yyyy-mm-dd"
    eventEndDate: { type: String },   // store in "yyyy-mm-dd"
    totalAmount: { type: Number },         // total price visible to customer
    totalMarginAmount: { type: Number },   // internal cost or profit calculation
    packageType: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
