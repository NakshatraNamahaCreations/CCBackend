const Complementary = require("../models/complementary");
const asyncHandler = require("express-async-handler");

// Create a new service
const createComplementary = asyncHandler(async (req, res) => {
  const { name, marginPrice } = req.body;

  if (!name || marginPrice == null) {
    res.status(400);
    throw new Error("Service name and marginPrice are required");
  }

  try {
    const service = await Complementary.create({ name, marginPrice });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Complementary name must be unique" });
    }
    console.error("Error creating Complementary:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all services
const getComplementaries = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await Complementary.countDocuments(query);
  const complementaries = await Complementary.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: complementaries.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: complementaries,
  });
});

// Get single service by ID
const getComplementary = asyncHandler(async (req, res) => {
  const complementary = await Complementary.findById(req.params.id);
  if (!complementary) {
    res.status(404);
    throw new Error("Complementary not found");
  }
  res.status(200).json({ success: true, data: complementary });
});

// Update a service by ID
const updateComplementary = asyncHandler(async (req, res) => {
  const { name, marginPrice } = req.body;
  const updatedData = {};
  if (name) updatedData.name = name;
  if (marginPrice != null) updatedData.marginPrice = marginPrice;

  const complementary = await Complementary.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!complementary) {
    res.status(404);
    throw new Error("Complementary not found");
  }

  res.status(200).json({ success: true, data: complementary });
});
// Delete a service by ID
const deleteComplementary = asyncHandler(async (req, res) => {
  const complementary = await Complementary.findByIdAndDelete(req.params.id);
  if (!complementary) {
    res.status(404);
    throw new Error("Complementary not found");
  }
  res
    .status(200)
    .json({ success: true, message: "Service deleted successfully" });
});

module.exports = {
  createComplementary,
  getComplementaries,
  getComplementary,
  updateComplementary,
  deleteComplementary,
};
