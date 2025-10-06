// const express = require('express');
// const router = express.Router();
// const dailyTaskController = require('../Controllers/dailyTaskController');

// // Create a new daily task
// router.post('/', dailyTaskController.createDailyTask);

// // Get all daily tasks
// router.get('/', dailyTaskController.getAllDailyTasks);
// router.get('/by-date', dailyTaskController.getDailyTaskByDate);

// // Get single daily task by ID
// router.get('/:id', dailyTaskController.getDailyTaskById);

// // Update daily task
// router.patch("/:id/status", dailyTaskController.updateStatus);

// // Delete daily task
// router.delete('/:id', dailyTaskController.deleteDailyTask);

// module.exports = router;


// routes/dailyTaskRoutes.js
const express = require('express');
const router = express.Router();
const dailyTaskController = require('../Controllers/dailyTaskController');

// Create a new daily task
router.post('/', dailyTaskController.createDailyTask);

// Get all daily tasks
router.get('/', dailyTaskController.getAllDailyTasks);

// Get all tasks created on a specific date (DD-MM-YYYY)
router.get('/by-date', dailyTaskController.getDailyTaskByDate);

// Get single daily task by ID
router.get('/:id', dailyTaskController.getDailyTaskById);

// Update task status (and reschedule when Pending)
router.patch('/:id/status', dailyTaskController.updateTaskStatus);

// Delete daily task
router.delete('/:id', dailyTaskController.deleteDailyTask);

module.exports = router;
