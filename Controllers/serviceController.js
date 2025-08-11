const Service = require('../models/service');
const asyncHandler = require('express-async-handler');

// Create a new service
const createService = asyncHandler(async (req, res) => {
  const { name, price, marginPrice } = req.body;

  if (!name || price == null || marginPrice == null) {
    res.status(400);
    throw new Error('Service name, price, and marginPrice are required');
  }

  try {
    const service = await Service.create({ name, price, marginPrice });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Service name must be unique' });
    }
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all services with pagination and search
const getServices = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search = '' } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const total = await Service.countDocuments(query);
  const services = await Service.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: services.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: services,
  });
});


// Get all services without pagination or search
const getAllServices = asyncHandler(async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});



// Get single service by ID
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.status(200).json({ success: true, data: service });
});

// Update a service by ID
const updateService = asyncHandler(async (req, res) => {
  const { name, price, marginPrice } = req.body;
  const updatedData = {};
  if (name) updatedData.name = name;
  if (price != null) updatedData.price = price;
  if (marginPrice != null) updatedData.marginPrice = marginPrice;

  const service = await Service.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.status(200).json({ success: true, data: service });
});
// Delete a service by ID
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.status(200).json({ success: true, message: 'Service deleted successfully' });
});

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getAllServices
};
