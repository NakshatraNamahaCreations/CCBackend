const mongoose = require("mongoose");
const Vendor = require("../models/vendor.model");
const VendorInventory  = require("../models/vendorInventory")
// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const newVendor = new Vendor(req.body);
    const savedVendor = await newVendor.save();
    res.status(201).json({ success: true, vendor: savedVendor });
  } catch (error) {
    console.error("Create Vendor Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create vendor", error });
  }
};

// Get All Vendors with pagination and search
exports.getAllVendors = async (req, res) => {
  try {
    const { page , limit , search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    const filter = {
      $or: [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { phoneNo: searchRegex },
        { email: searchRegex },
        { category: searchRegex },
      ],
    };

    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .sort({ createdAt: -1 }) // 🔽 Sort by newest first
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Vendor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      vendors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors", error });
  }
};

// Get Vendors by Service ID with pagination and search
exports.getVendorsByServiceId = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    const filter = {
      "services.serviceId": serviceId,
      // status: "Available",
      $or: [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { phoneNo: searchRegex },
        { email: searchRegex },
      ],
    };

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).skip(skip).limit(parseInt(limit)).lean(),
      Vendor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      vendors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Vendors By Service ID Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors", error });
  }
};

// Get Vendors by Service Name with pagination and search
exports.getVendorsByServiceName = async (req, res) => {
  try {
    const serviceName = req.params.serviceName;
    const { page, limit, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    const filter = {
      "services.name": serviceName,
      // status: "Available",
      $or: [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { phoneNo: searchRegex },
        { email: searchRegex },
      ],
    };

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).skip(skip).limit(parseInt(limit)).lean(),
      Vendor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      vendors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Vendors By Service Name Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors", error });
  }
};

// API to fetch available vendors for specific date and service name
exports.getAvailableVendorsByServiceAndDate = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { date } = req.query;

    // Validate required parameters
    if (!serviceName) {
      return res.status(400).json({
        success: false,
        message: "Service name parameter is required"
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required"
      });
    }

    // Get all vendor IDs that are booked on the specified date
    const bookedVendorIds = await VendorInventory.find({ date: date })
      .distinct('vendorId');

    // Fetch vendors that provide the specified service AND are not booked on the date
    const availableVendors = await Vendor.find({
      'services.name': { $regex: new RegExp(serviceName, 'i') }, // Case-insensitive search
      _id: { $nin: bookedVendorIds }
    });

    return res.status(200).json({
      success: true,
      data: {
        availableVendors,
        totalAvailable: availableVendors.length,
        serviceName: serviceName,
        date: date
      }
    });

  } catch (err) {
    console.error("getAvailableVendorsByServiceAndDate error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedVendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    res.status(200).json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error("Update Vendor Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update vendor", error });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!deletedVendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    res
      .status(200)
      .json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete vendor", error });
  }
};

// Fetch all available inhouse vendors (only selected fields)
exports.getAvailableInhouseVendors = async (req, res) => {
  const vendors = await Vendor.find(
    { category: "Inhouse Vendor",},
    { name: 1, category: 1, phoneNo: 1, alternatePhoneNo: 1, email: 1, _id: 1 }
  ).sort("name");

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors,
  });
};
