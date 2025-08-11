// // C:\Users\admin\Documents\cc\backend\Controllers\vendorController.js
// const mongoose = require('mongoose');
// const Vendor = require('../models/vendor.model');

// const isValidObjectId = mongoose.Types.ObjectId.isValid;

// // Create a new vendor
// exports.createVendor = async (req, res) => {
//   try {
//     const { id, name, category, contactPerson, phoneNo, email, address, services, designation, expertiseLevel, camera, otherEquipment } = req.body;

//     // Validate required fields
//     if (!id) {
//       return res.status(400).json({ success: false, message: 'Vendor ID (UUID) is required' });
//     }
//     if (!name || typeof name !== 'string' || name.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Vendor name is required and must be a non-empty string' });
//     }
//     if (!category || !['Inhouse Vendor', 'Outsource Vendor'].includes(category)) {
//       return res.status(400).json({ success: false, message: 'Category must be either "Inhouse Vendor" or "Outsource Vendor"' });
//     }
//     if (!contactPerson || typeof contactPerson !== 'string' || contactPerson.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Contact person name is required' });
//     }
//     if (!phoneNo || !/^\+?[1-9]\d{1,14}$/.test(phoneNo)) {
//       return res.status(400).json({ success: false, message: 'Valid phone number is required' });
//     }
//     if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
//       return res.status(400).json({ success: false, message: 'Valid email is required' });
//     }
//     if (!address || typeof address !== 'string' || address.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Address is required' });
//     }
//     if (!Array.isArray(services) || services.length === 0) {
//       return res.status(400).json({ success: false, message: 'At least one service is required' });
//     }
//     for (const service of services) {
//       if (!service.id || !service.serviceName || typeof service.price !== 'number' || service.price < 0) {
//         return res.status(400).json({ success: false, message: 'Each service must have an id, serviceName, and price (non-negative number)' });
//       }
//     }
//     if (designation && (typeof designation !== 'string')) {
//       return res.status(400).json({ success: false, message: 'Designation must be a string' });
//     }
//     if (expertiseLevel && !['Beginner', 'Intermediate', 'Advanced', ''].includes(expertiseLevel)) {
//       return res.status(400).json({ success: false, message: 'Expertise level must be either "Beginner", "Intermediate", or "Advanced"' });
//     }
//     if (camera && typeof camera !== 'string') {
//       return res.status(400).json({ success: false, message: 'Camera must be a string' });
//     }
//     if (otherEquipment && typeof otherEquipment !== 'string') {
//       return res.status(400).json({ success: false, message: 'Other equipment must be a string' });
//     }

//     // Check for duplicate ID
//     const existingVendor = await Vendor.findOne({ id });
//     if (existingVendor) {
//       return res.status(400).json({ success: false, message: 'Vendor ID already exists' });
//     }

//     // Create new vendor
//     const vendor = new Vendor({
//       id,
//       name,
//       category,
//       contactPerson,
//       phoneNo,
//       email,
//       address,
//       services,
//       designation: designation || '',
//       expertiseLevel: expertiseLevel || '',
//       camera: category === 'Outsource Vendor' ? (camera || '') : '',
//       otherEquipment: category === 'Outsource Vendor' ? (otherEquipment || '') : '',
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });

//     await vendor.save();
//     res.status(201).json({ success: true, data: vendor });
//   } catch (error) {
//     console.error('Error in createVendor:', error);
//     res.status(400).json({ success: false, message: error.message || 'Failed to create vendor' });
//   }
// };

// // Get all vendors
// exports.getAllVendors = async (req, res) => {
//   try {
//     const vendors = await Vendor.find();
//     res.status(200).json({ success: true, data: vendors });
//   } catch (error) {
//     console.error('Error in getAllVendors:', error);
//     res.status(500).json({ success: false, message: error.message || 'Failed to fetch vendors' });
//   }
// };

// // Get vendors by category
// exports.getVendorsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
//     const { assignedOnly } = req.query; // Optional: Filter vendors with assigned services

//     if (!['Inhouse Vendor', 'Outsource Vendor'].includes(category)) {
//       return res.status(400).json({ success: false, message: 'Category must be either "Inhouse Vendor" or "Outsource Vendor"' });
//     }

//     let vendors = await Vendor.find({ category });

//     if (assignedOnly === 'true') {
//       // Find quotations with assigned vendors in the given category
//       const quotations = await Quotation.find({
//         isFinalized: true,
//         'packages.services.vendorCategory': category,
//       });

//       const assignedVendorIds = new Set();
//       quotations.forEach((quotation) => {
//         quotation.packages.forEach((pkg) => {
//           pkg.services.forEach((service) => {
//             if (service.vendorId && service.vendorCategory === category) {
//               assignedVendorIds.add(service.vendorId);
//             }
//           });
//         });
//       });

//       vendors = vendors.filter((vendor) => assignedVendorIds.has(vendor.id));
//     }

//     res.status(200).json({ success: true, data: vendors });
//   } catch (error) {
//     console.error('Error in getVendorsByCategory:', error);
//     res.status(500).json({ success: false, message: error.message || 'Failed to fetch vendors by category' });
//   }
// };

// // Get a vendor by ID
// exports.getVendorById = async (req, res) => {
//   try {
//     const idParam = req.params.id;
//     let vendor = null;

//     if (isValidObjectId(idParam)) {
//       vendor = await Vendor.findOne({
//         $or: [{ _id: idParam }, { id: idParam }],
//       });
//     } else {
//       vendor = await Vendor.findOne({ id: idParam });
//     }

//     if (!vendor) {
//       return res.status(404).json({ success: false, message: `Vendor not found for ID: ${idParam}` });
//     }
//     res.status(200).json({ success: true, data: vendor });
//   } catch (error) {
//     console.error('Error in getVendorById:', error);
//     res.status(500).json({ success: false, message: error.message || 'Failed to fetch vendor' });
//   }
// };

// // Update a vendor
// exports.updateVendor = async (req, res) => {
//   try {
//     const idParam = req.params.id;
//     const { name, category, contactPerson, phoneNo, email, address, services, designation, expertiseLevel, camera, otherEquipment } = req.body;

//     let vendor = null;
//     if (isValidObjectId(idParam)) {
//       vendor = await Vendor.findOne({
//         $or: [{ _id: idParam }, { id: idParam }],
//       });
//     } else {
//       vendor = await Vendor.findOne({ id: idParam });
//     }

//     if (!vendor) {
//       return res.status(404).json({ success: false, message: `Vendor not found for ID: ${idParam}` });
//     }

//     // Validate fields
//     if (name && (typeof name !== 'string' || name.trim() === '')) {
//       return res.status(400).json({ success: false, message: 'Vendor name must be a non-empty string' });
//     }
//     if (category && !['Inhouse Vendor', 'Outsource Vendor'].includes(category)) {
//       return res.status(400).json({ success: false, message: 'Category must be either "Inhouse Vendor" or "Outsource Vendor"' });
//     }
//     if (contactPerson && (typeof contactPerson !== 'string' || contactPerson.trim() === '')) {
//       return res.status(400).json({ success: false, message: 'Contact person name must be a non-empty string' });
//     }
//     if (phoneNo && !/^\+?[1-9]\d{1,14}$/.test(phoneNo)) {
//       return res.status(400).json({ success: false, message: 'Valid phone number is required' });
//     }
//     if (email && !/^\S+@\S+\.\S+$/.test(email)) {
//       return res.status(400).json({ success: false, message: 'Valid email is required' });
//     }
//     if (address && (typeof address !== 'string' || address.trim() === '')) {
//       return res.status(400).json({ success: false, message: 'Address must be a non-empty string' });
//     }
//     if (services) {
//       if (!Array.isArray(services) || services.length === 0) {
//         return res.status(400).json({ success: false, message: 'At least one service is required' });
//       }
//       for (const service of services) {
//         if (!service.id || !service.serviceName || typeof service.price !== 'number' || service.price < 0) {
//           return res.status(400).json({ success: false, message: 'Each service must have an id, serviceName, and price (non-negative number)' });
//         }
//       }
//     }
//     if (designation && typeof designation !== 'string') {
//       return res.status(400).json({ success: false, message: 'Designation must be a string' });
//     }
//     if (expertiseLevel && !['Beginner', 'Intermediate', 'Advanced', ''].includes(expertiseLevel)) {
//       return res.status(400).json({ success: false, message: 'Expertise level must be either "Beginner", "Intermediate", or "Advanced"' });
//     }
//     if (camera && typeof camera !== 'string') {
//       return res.status(400).json({ success: false, message: 'Camera must be a string' });
//     }
//     if (otherEquipment && typeof otherEquipment !== 'string') {
//       return res.status(400).json({ success: false, message: 'Other equipment must be a string' });
//     }

//     // Update fields
//     if (name) vendor.name = name;
//     if (category) vendor.category = category;
//     if (contactPerson) vendor.contactPerson = contactPerson;
//     if (phoneNo) vendor.phoneNo = phoneNo;
//     if (email) vendor.email = email;
//     if (address) vendor.address = address;
//     if (services) vendor.services = services;
//     if (designation !== undefined) vendor.designation = designation;
//     if (expertiseLevel !== undefined) vendor.expertiseLevel = expertiseLevel;
//     if (category === 'Outsource Vendor' || vendor.category === 'Outsource Vendor') {
//       if (camera !== undefined) vendor.camera = camera;
//       if (otherEquipment !== undefined) vendor.otherEquipment = otherEquipment;
//     } else {
//       vendor.camera = ''; // Clear equipment fields for Inhouse Vendors
//       vendor.otherEquipment = '';
//     }
//     vendor.updatedAt = Date.now();

//     await vendor.save();
//     res.status(200).json({ success: true, data: vendor });
//   } catch (error) {
//     console.error('Error in updateVendor:', error);
//     res.status(400).json({ success: false, message: error.message || 'Failed to update vendor' });
//   }
// };

// // Delete a vendor
// exports.deleteVendor = async (req, res) => {
//   try {
//     const idParam = req.params.id;
//     let vendor = null;

//     if (isValidObjectId(idParam)) {
//       vendor = await Vendor.findOneAndDelete({
//         $or: [{ _id: idParam }, { id: idParam }],
//       });
//     } else {
//       vendor = await Vendor.findOneAndDelete({ id: idParam });
//     }

//     if (!vendor) {
//       return res.status(404).json({ success: false, message: `Vendor not found for ID: ${idParam}` });
//     }

//     res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
//   } catch (error) {
//     console.error('Error in deleteVendor:', error);
//     res.status(400).json({ success: false, message: error.message || 'Failed to delete vendor' });
//   }
// };

const mongoose = require("mongoose");
const Vendor = require("../models/vendor.model");

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
    const { page = 1, limit = 10, search = "" } = req.query;
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
      status: "Available",
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
      status: "Available",
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
    { category: "Inhouse Vendor", status: "Available" },
    { name: 1, category: 1, phoneNo: 1, alternatePhoneNo: 1, email: 1, _id: 1 }
  ).sort("name");

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors,
  });
};
