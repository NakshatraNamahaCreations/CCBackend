const Category = require("../models/category");
const asyncHandler = require("express-async-handler");

// Create Category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  try {
    const category = await Category.create({ name });
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "Category name must be unique",
      });
    }
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get Categories with pagination
const getCategories = asyncHandler(async (req, res) => {
  let { page = 1, limit = 5, search = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: categories.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: categories,
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching all categories:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});
// Get Single Category
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// Update Category
const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
