// const express = require('express');
// const router = express.Router();
// const { assignTask ,  getOverallCounts, getAssignedCounts, getAssignmentsByEventAndService, getDetailedMediaAssignmentStatus, getOverallMediaNeedingAssignment } = require('../Controllers/assignedTaskController');

// router.post('/assign-task', assignTask);
// router.get('/overall-counts', getOverallCounts);
// router.get("/assignments/:eventId/:serviceName", getAssignmentsByEventAndService);
// router.get("/assigned-counts", getAssignedCounts);
// router.get('/detailed-media-status', getDetailedMediaAssignmentStatus);
// // router.get('/detailed-media', getOverallMediaNeedingAssignment);

// module.exports = router;
const express = require("express");
const router = express.Router();

const {
  assignTask,
  submitTask,
  updateTaskStatus,
  getTaskByServiceUnit
} = require("../Controllers/assignedTaskController");

// Assign new task
router.post("/assign", assignTask);

// Vendor submit task
router.post("/:id/submit", submitTask);

// Update task status
router.patch("/:id/status", updateTaskStatus);

// ✅ FIXED: consistent route with frontend
router.get("/service-unit/:unitId", getTaskByServiceUnit);

module.exports = router;
