// // controllers/package.controller.js

// const Package = require('../models/package.model');

// // Create a new package
// exports.createPackage = async (req, res) => {
//   try {
//     const {
//       packageName,
//       services,
//       date,
//       timeSlot,
//       venueName,
//       venueAddress,
//       totalAmount,
//       isPreset,
//     } = req.body;

//     if (!packageName || !services || !Array.isArray(services) || services.length === 0) {
//       return res.status(400).json({ message: 'packageName and services are required' });
//     }

//     const newPackage = new Package({
//       packageName,
//       services,
//       date,
//       timeSlot,
//       venueName,
//       venueAddress,
//       totalAmount,
//       isPreset: isPreset || false,
//     });

//     await newPackage.save();

//     return res.status(201).json({ message: 'Package created successfully', data: newPackage });
//   } catch (error) {
//     console.error('Create Package Error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Fetch all packages
// exports.getPackages = async (req, res) => {
//   try {
//     const packages = await Package.find().sort({ createdAt: -1 });
//     return res.status(200).json({ data: packages });
//   } catch (error) {
//     console.error('Get Packages Error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

const Package = require('../models/package.model'); // Import the Package model
const Lead = require('../models/lead'); // Optional: if you want to check lead validity
const Query = require('../models/query'); // Optional: if you want to check query validity

// Create a new package
exports.createPackage = async (req, res) => {
  const {
    leadId,
    queryId,
    packageName,
    services,
    timeSlot,
    venueName,
    venueAddress,
    eventStartDate,
    eventEndDate,
    packageType,
  } = req.body;

  try {
    // Validate leadId and queryId (if needed)
    const lead = await Lead.findById(leadId);
    const query = await Query.findById(queryId);

    if (!lead || !query) {
      return res.status(404).json({ error: 'Lead or Query not found' });
    }

    // Calculate totalAmount and totalMarginAmount from services
    const totalAmount = services.reduce((sum, service) => sum + service.price * service.qty, 0);
    const totalMarginAmount = services.reduce((sum, service) => sum + service.marginPrice * service.qty, 0);

    const newPackage = new Package({
      leadId,
      queryId,
      packageName,
      services,
      timeSlot,
      venueName,
      venueAddress,
      eventStartDate,
      eventEndDate,
      totalAmount,
      totalMarginAmount,
      packageType,
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create package' });
  }
};

// Get all packages (optionally filtered by leadId or queryId)
exports.getPackages = async (req, res) => {
  try {
    const { leadId, queryId } = req.query;

    const filter = {};
    if (leadId) filter.leadId = leadId;
    if (queryId) filter.queryId = queryId;

    const packages = await Package.find(filter);
    res.status(200).json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findById(id);

    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.status(200).json(package);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
};

// Update an existing package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      packageName,
      services,
      timeSlot,
      venueName,
      venueAddress,
      eventStartDate,
      eventEndDate,
      packageType,
    } = req.body;

    // Calculate totalAmount and totalMarginAmount from services
    const totalAmount = services.reduce((sum, service) => sum + service.price * service.qty, 0);
    const totalMarginAmount = services.reduce((sum, service) => sum + service.marginPrice * service.qty, 0);

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      {
        packageName,
        services,
        timeSlot,
        venueName,
        venueAddress,
        eventStartDate,
        eventEndDate,
        totalAmount,
        totalMarginAmount,
        packageType,
      },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.status(200).json(updatedPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update package' });
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
};
