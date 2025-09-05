const asyncHandler = require("express-async-handler");
const VendorInventory = require("../models/vendorInventory");

exports.getAllVendorInventory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const vendorInventory = await VendorInventory.find({})
    .skip(skip)
    .limit(limit);

  const total = await VendorInventory.countDocuments();

  res.status(200).json({
    success: true,
    data: vendorInventory,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
