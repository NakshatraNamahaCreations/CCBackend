
// const mongoose = require("mongoose");

// const vendorInventorySchema = new mongoose.Schema(
//   {
//     vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
//     vendorName: String,
//     eventStartDate: String, // ✅ range start
//     eventEndDate: String,   // ✅ range end
//     slot: String,           // Morning (8AM - 1PM), Afternoon (12PM - 5PM), Evening (5PM - 9PM),Midnight (9PM - 12AM), Full Day
//   },
//   { timestamps: true }
// );

// const VendorInventory = mongoose.model("VendorInventory", vendorInventorySchema);
// module.exports = VendorInventory;


// models/VendorInventory.js
const mongoose = require("mongoose");

const vendorInventorySchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: String,

    // NEW: uniquely tie this inventory to quotation/service
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
    packageId: String,
    serviceId: String,
    unitIndex: Number,

    eventStartDate: String, // store as YYYY-MM-DD
    eventEndDate: String,
    slot: String, // Morning, Afternoon, Evening, Midnight, Full Day
  },
  { timestamps: true }
);

const VendorInventory = mongoose.model("VendorInventory", vendorInventorySchema);
module.exports = VendorInventory;
