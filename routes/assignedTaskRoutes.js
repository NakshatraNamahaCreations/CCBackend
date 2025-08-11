const express = require('express');
const router = express.Router();
const { assignTask ,  getOverallCounts, getAssignedCounts, getAssignmentsByEventAndService } = require('../Controllers/assignedTaskController');

router.post('/assign-task', assignTask);
router.get('/overall-counts', getOverallCounts);
router.get("/assignments/:eventId/:serviceName", getAssignmentsByEventAndService);
router.get("/assigned-counts", getAssignedCounts);
module.exports = router;