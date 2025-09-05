const mongoose = require("mongoose");

const vendorInventorySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    vendorName: String,
    date: String,
    slot: String,
  },
  { timestamps: true }
);

const vendorInventory = mongoose.model(
  "vendorInventory",
  vendorInventorySchema
);
module.exports = vendorInventory;
