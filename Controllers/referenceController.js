const Reference = require("../models/reference");
const asyncHandler = require("express-async-handler");

// Create a new reference
const createReference = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Reference name is required");
  }
  try {
    const reference = await Reference.create({ name });
    res.status(201).json({ success: true, data: reference });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Reference name must be unique" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all references with pagination and search
const getReferences = asyncHandler(async (req, res) => {
  let { page ,limit,  search = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await Reference.countDocuments(query);
  const references = await Reference.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: references.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: references,
  });
});

// Get single reference by ID
const getReference = asyncHandler(async (req, res) => {
  const reference = await Reference.findById(req.params.id);
  if (!reference) {
    res.status(404);
    throw new Error("Reference not found");
  }
  res.status(200).json({ success: true, data: reference });
});

// Update a reference by ID
const updateReference = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const reference = await Reference.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );
  if (!reference) {
    res.status(404);
    throw new Error("Reference not found");
  }
  res.status(200).json({ success: true, data: reference });
});

// Delete a reference by ID
const deleteReference = asyncHandler(async (req, res) => {
  const reference = await Reference.findByIdAndDelete(req.params.id);
  if (!reference) {
    res.status(404);
    throw new Error("Reference not found");
  }
  res
    .status(200)
    .json({ success: true, message: "Reference deleted successfully" });
});

module.exports = {
  createReference,
  getReferences,
  getReference,
  updateReference,
  deleteReference,
};
