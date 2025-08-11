const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../Controllers/categoryController");

// ✅ Place this BEFORE 
router.get("/all", getAllCategories); 

// Normal routes
router.route("/").post(createCategory).get(getCategories);
router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
