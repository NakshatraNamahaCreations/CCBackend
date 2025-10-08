const express = require("express");
const router = express.Router();
const {
  assignPhotoEditingTask,
  submitPhotoEditingTask,
  getAllPhotoEditingTasks,
  getPhotoEditingTaskById,
  getPhotoEditingTasksByQuotation,
} = require("../Controllers/photoEditingController");

// Assign new photo editing task
router.post("/assign", assignPhotoEditingTask);

// Submit a completed task
router.post("/:id/submit", submitPhotoEditingTask);

// Fetch all photo editing tasks
router.get("/", getAllPhotoEditingTasks);

// Fetch tasks by quotation
router.get("/quotation/:quotationId", getPhotoEditingTasksByQuotation);

// Fetch single photo editing task
router.get("/:id", getPhotoEditingTaskById);

module.exports = router;
