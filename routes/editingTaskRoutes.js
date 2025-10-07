const express = require("express");
const router = express.Router();
const editingTaskController = require("../Controllers/editingTaskController");

// ✅ Assign a new editing task
router.post("/assign", editingTaskController.assignEditingTask);

// ✅ Submit (complete) an editing task
router.post("/:taskId/submit", editingTaskController.submitEditingTask);

// ✅ Optional routes
// router.get("/", editingTaskController.getAllEditingTasks);
router.get("/:taskId", editingTaskController.getEditingTaskById);

// Add this route to your editing task routes
router.get("/quotation/:quotationId", editingTaskController.getEditingTasksByQuotation);

module.exports = router;
