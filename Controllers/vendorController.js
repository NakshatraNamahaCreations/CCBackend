const mongoose = require("mongoose");
const Vendor = require("../models/vendor.model");
const VendorInventory  = require("../models/vendorInventory")
const dayjs = require("dayjs");  
const Quotation = require("../models/quotation.model");

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
// exports.getAvailableVendorsByServiceAndDate = async (req, res) => {
//   try {
//     const { serviceName } = req.params;
//     const { date } = req.query;

//     // Validate required parameters
//     if (!serviceName) {
//       return res.status(400).json({
//         success: false,
//         message: "Service name parameter is required"
//       });
//     }

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date query parameter is required"
//       });
//     }

//     // Get all vendor IDs that are booked on the specified date
//     const bookedVendorIds = await VendorInventory.find({ date: date })
//       .distinct('vendorId');

//     // Fetch vendors that provide the specified service AND are not booked on the date
//     const availableVendors = await Vendor.find({
//       'services.name': { $regex: new RegExp(serviceName, 'i') }, // Case-insensitive search
//       _id: { $nin: bookedVendorIds }
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         availableVendors,
//         totalAvailable: availableVendors.length,
//         serviceName: serviceName,
//         date: date
//       }
//     });

//   } catch (err) {
//     console.error("getAvailableVendorsByServiceAndDate error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message
//     });
//   }
// };


// API to fetch available vendors for specific date and service name
exports.getAvailableVendorsByServiceAndDate = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { date, slot } = req.query;

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

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: "Slot query parameter is required"
      });
    }

    // Step 1: Fetch all vendors whose specialization.name matches the serviceName
    const allVendors = await Vendor.find({
      "specialization.name": { $regex: new RegExp(serviceName, "i") } // Case-insensitive search
    });

    // Step 2: Fetch all vendorInventory records for the given date and slot
    const vendorInventoryRecords = await VendorInventory.find({
      date: date,
      slot: slot
    });

    // Step 3: Map through all vendors and check availability
    const availableVendors = allVendors.filter(vendor => {
      // Check if vendor ID exists in inventory records
      const isBooked = vendorInventoryRecords.some(inventory => 
        inventory.vendorId.toString() === vendor._id.toString()
      );
      
      // Return true if vendor is NOT booked (available)
      return !isBooked;
    });

    return res.status(200).json({
      success: true,
      data: {
        availableVendors,
        totalAvailable: availableVendors.length,
        totalVendorsForService: allVendors.length,
        serviceName,
        date,
        slot
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
// exports.updateVendor = async (req, res) => {
//   try {
//     const updatedVendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     if (!updatedVendor)
//       return res
//         .status(404)
//         .json({ success: false, message: "Vendor not found" });
//     res.status(200).json({ success: true, vendor: updatedVendor });
//   } catch (error) {
//     console.error("Update Vendor Error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to update vendor", error });
//   }
// };

// Update Vendor Details
exports.updateVendor = async (req, res) => {
  try {
    const vendorId = req.params.id; // Vendor ID from URL
    const {
      name,
      category,
      contactPerson,
      phoneNo,
      alternatePhoneNo,
      email,
      address,
      services,
      equipmentDetails,
      bankDetails,
      experience,
      designation,
      expertiseLevel,
      camera,
      otherEquipment,
      status, // Optional status field
    } = req.body;


    // Construct the update payload (only fields passed in the request will be updated)
    const updatedVendorData = {
      name,
      category,
      contactPerson,
      phoneNo,
      alternatePhoneNo,
      email,
      address,
      services,
      equipmentDetails,
      bankDetails,
      experience,
      designation,
      expertiseLevel,
      camera,
      otherEquipment,
      status, // Optional, not required
    };

    // Ensure that only fields with values are updated
    Object.keys(updatedVendorData).forEach(key => updatedVendorData[key] === undefined && delete updatedVendorData[key]);

    // Update the vendor document in the database
    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updatedVendorData, {
      new: true, // Return the updated vendor
      runValidators: true, // Ensure validations are run (e.g., required fields, format)
    });

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ success: false, message: "Failed to update vendor", error });
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


exports.vendorPayment = async (req, res) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    // 1. Fetch quotations except those with bookingStatus = NotBooked
    const quotations = await Quotation.find({
      bookingStatus: { $ne: "NotBooked" }
    }).lean();

    // 2. Fetch all vendors once and index them
    const vendors = await Vendor.find().lean();
    const vendorMap = {};
    for (const v of vendors) {
      vendorMap[v._id.toString()] = v;
    }

    // 3. Payments store
    const vendorPayments = {};

    // 4. Process quotations
    for (const quotation of quotations) {
      for (const pkg of quotation.packages) {
        if (dayjs(pkg.eventStartDate).isBefore(today)) {
          for (const service of pkg.services) {
            for (const vendor of service.assignedVendors) {
              if (!vendor) continue;

              const vendorDoc = vendorMap[vendor.vendorId.toString()];
              if (!vendorDoc) continue;

              // Match specialization salary
              const specialization = vendorDoc.specialization.find(
                (s) => s.name === service.serviceName
              );

              if (specialization?.salary) {
                if (!vendorPayments[vendor.vendorId]) {
                  vendorPayments[vendor.vendorId] = {
                    vendorName: vendor.vendorName,
                    totalSalary: 0,
                    events: []
                  };
                }
         

                vendorPayments[vendor.vendorId].totalSalary += specialization.salary;
                vendorPayments[vendor.vendorId].events.push({
                  quoteId: quotation.quotationId,
                  quotationId: quotation._id,
                  serviceName: service.serviceName,
                  eventDate: pkg.eventStartDate,
                  slot: pkg.slot,
                  salary: specialization.salary
                });
              }
            }
          }
        }
      }
    }

    return res.json({ success: true, data: vendorPayments });
  } catch (err) {
    console.error("Error calculating vendor payments:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


