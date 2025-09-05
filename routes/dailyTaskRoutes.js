const express = require('express');
const router = express.Router();
const dailyTaskController = require('../Controllers/dailyTaskController');

// Create a new daily task
router.post('/', dailyTaskController.createDailyTask);

// Get all daily tasks
router.get('/', dailyTaskController.getAllDailyTasks);
router.get('/by-date', dailyTaskController.getDailyTaskByDate);

// Get single daily task by ID
router.get('/:id', dailyTaskController.getDailyTaskById);

// Update daily task
router.put('/:id', dailyTaskController.updateDailyTask);

// Delete daily task
router.delete('/:id', dailyTaskController.deleteDailyTask);

module.exports = router;