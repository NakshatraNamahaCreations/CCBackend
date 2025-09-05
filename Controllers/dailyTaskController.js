const DailyTask = require('../models/dailyTask');

// Create a new daily task
exports.createDailyTask = async (req, res) => {
    try {
        const { vendorId, vendorName, role, task } = req.body;
        
        const newTask = new DailyTask({
            vendorId,
            vendorName,
            role,
            task
        });

        const savedTask = await newTask.save();
        res.status(201).json({
            success: true,
            message: 'Daily task created successfully',
            data: savedTask
        });
    } catch (error) {
        console.error('Error creating daily task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create daily task',
            error: error.message
        });
    }
};

// Get all daily tasks
exports.getAllDailyTasks = async (req, res) => {
    try {
        const tasks = await DailyTask.find().populate('vendorId', 'name email phone');
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching daily tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily tasks',
            error: error.message
        });
    }
};

// Get single daily task by ID
exports.getDailyTaskById = async (req, res) => {
    try {
        const task = await DailyTask.findById(req.params.id).populate('vendorId', 'name email phone');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Daily task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching daily task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily task',
            error: error.message
        });
    }
};

// Update daily task
exports.updateDailyTask = async (req, res) => {
    try {
        const { vendorId, vendorName, role, task } = req.body;
        
        const updatedTask = await DailyTask.findByIdAndUpdate(
            req.params.id,
            {
                vendorId,
                vendorName,
                role,
                task
            },
            { new: true, runValidators: true }
        ).populate('vendorId', 'name email phone');

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Daily task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Daily task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error updating daily task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update daily task',
            error: error.message
        });
    }
};

// Delete daily task
exports.deleteDailyTask = async (req, res) => {
    try {
        const deletedTask = await DailyTask.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Daily task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Daily task deleted successfully',
            data: deletedTask
        });
    } catch (error) {
        console.error('Error deleting daily task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete daily task',
            error: error.message
        });
    }
};


// API to fetch tasks by date
exports.getDailyTaskByDate = async (req, res) => {
    try {
        const { date } = req.query; // Expected format: "18-08-2025"
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date parameter is required (format: DD-MM-YYYY)"
            });
        }

        // Parse the date string into day, month, year
        const [day, month, year] = date.split('-').map(Number);
        
        // Create start and end dates for the query (UTC)
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const tasks = await DailyTask.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('vendorId', 'name email'); // Populate vendor details

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error("Error fetching tasks by date:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

