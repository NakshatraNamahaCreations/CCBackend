const express = require('express');
const router = express.Router();
const { assignTask ,  getOverallCounts, getAssignedCounts, getAssignmentsByEventAndService, getDetailedMediaAssignmentStatus, getOverallMediaNeedingAssignment } = require('../Controllers/assignedTaskController');

router.post('/assign-task', assignTask);
router.get('/overall-counts', getOverallCounts);
router.get("/assignments/:eventId/:serviceName", getAssignmentsByEventAndService);
router.get("/assigned-counts", getAssignedCounts);
router.get('/detailed-media-status', getDetailedMediaAssignmentStatus);
// router.get('/detailed-media', getOverallMediaNeedingAssignment);

module.exports = router;