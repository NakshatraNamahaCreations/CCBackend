// const DailyTask = require('../models/dailyTask');

// // Create a new daily task
// exports.createDailyTask = async (req, res) => {
//     try {
//         const { vendorId, vendorName, role, task } = req.body;

//         const newTask = new DailyTask({
//             vendorId,
//             vendorName,
//             role,
//             task
//         });

//         const savedTask = await newTask.save();
//         res.status(201).json({
//             success: true,
//             message: 'Daily task created successfully',
//             data: savedTask
//         });
//     } catch (error) {
//         console.error('Error creating daily task:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create daily task',
//             error: error.message
//         });
//     }
// };

// // Get all daily tasks
// exports.getAllDailyTasks = async (req, res) => {
//     try {
//         const tasks = await DailyTask.find().populate('vendorId', 'name email phone');
//         res.status(200).json({
//             success: true,
//             data: tasks
//         });
//     } catch (error) {
//         console.error('Error fetching daily tasks:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch daily tasks',
//             error: error.message
//         });
//     }
// };

// // Get single daily task by ID
// exports.getDailyTaskById = async (req, res) => {
//     try {
//         const task = await DailyTask.findById(req.params.id).populate('vendorId', 'name email phone');

//         if (!task) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Daily task not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: task
//         });
//     } catch (error) {
//         console.error('Error fetching daily task:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch daily task',
//             error: error.message
//         });
//     }
// };

// // Update daily task
// exports.updateDailyTask = async (req, res) => {
//     try {
//         const { vendorId, vendorName, role, task } = req.body;

//         const updatedTask = await DailyTask.findByIdAndUpdate(
//             req.params.id,
//             {
//                 vendorId,
//                 vendorName,
//                 role,
//                 task
//             },
//             { new: true, runValidators: true }
//         ).populate('vendorId', 'name email phone');

//         if (!updatedTask) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Daily task not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Daily task updated successfully',
//             data: updatedTask
//         });
//     } catch (error) {
//         console.error('Error updating daily task:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update daily task',
//             error: error.message
//         });
//     }
// };

// // API to fetch tasks by date
// // exports.getDailyTaskByDate = async (req, res) => {
// //     try {
// //         const { date } = req.query; // Expected format: "18-08-2025"

// //         if (!date) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Date parameter is required (format: DD-MM-YYYY)"
// //             });
// //         }

// //         // Parse the date string into day, month, year
// //         const [day, month, year] = date.split('-').map(Number);

// //         // Create start and end dates for the query (UTC)
// //         const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
// //         const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

// //         const tasks = await DailyTask.find({
// //             createdAt: {
// //                 $gte: startDate,
// //                 $lte: endDate
// //             }
// //         }).populate('vendorId', 'name email'); // Populate vendor details

// //         res.json({
// //             success: true,
// //             data: tasks
// //         });

// //     } catch (error) {
// //         console.error("Error fetching tasks by date:", error);
// //         res.status(500).json({
// //             success: false,
// //             message: "Internal server error"
// //         });
// //     }
// // };

// // API to fetch tasks by date (created that day OR rescheduled to that day)
// exports.getDailyTaskByDate = async (req, res) => {
//   try {
//     const { date } = req.query; // Expected format: "DD-MM-YYYY" e.g. "18-08-2025"

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date parameter is required (format: DD-MM-YYYY)",
//       });
//     }

//     // Parse "DD-MM-YYYY"
//     const [day, month, year] = date.split("-").map(Number);
//     if (
//       !Number.isInteger(day) ||
//       !Number.isInteger(month) ||
//       !Number.isInteger(year)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date. Use format DD-MM-YYYY",
//       });
//     }

//     // Build UTC range for that calendar day
//     const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
//     const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

//     // Match: createdAt in range OR (rescheduleDate exists AND in range)
//     const tasks = await DailyTask.find({
//       $or: [
//         { createdAt: { $gte: startDate, $lte: endDate } },
//         { rescheduleDate: { $gte: startDate, $lte: endDate } },
//       ],
//     }).populate("vendorId", "name email");

//     return res.json({
//       success: true,
//       data: tasks,
//     });
//   } catch (error) {
//     console.error("Error fetching tasks by date:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// // PATCH /api/daily-tasks/:id/status
// // body: { status: "Completed" } OR { status: "Pending", rescheduleDate: "YYYY-MM-DD" }
// exports.updateStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, rescheduleDate } = req.body;

//     if (!["Pending", "Completed", "Created"].includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }

//     const task = await DailyTask.findById(id);
//     if (!task) {
//       return res.status(404).json({ success: false, message: "Task not found" });
//     }

//     task.status = status;

//     if (status === "Pending") {
//       if (!rescheduleDate || !moment(rescheduleDate, "YYYY-MM-DD", true).isValid()) {
//         return res.status(400).json({
//           success: false,
//           message: "rescheduleDate (YYYY-MM-DD) is required when status is Pending",
//         });
//       }
//       task.rescheduleDate = moment(rescheduleDate, "YYYY-MM-DD").startOf("day").toDate();
//     } else if (status === "Completed") {
//       task.rescheduleDate = undefined; // clear it
//     }

//     await task.save();
//     const populated = await task.populate("vendorId");
//     return res.json({ success: true, data: populated });
//   } catch (err) {
//     console.error("updateStatus error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // DELETE /api/daily-tasks/:id
// exports.deleteDailyTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await DailyTask.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ success: false, message: "Task not found" });
//     }
//     return res.json({ success: true, message: "Task deleted" });
//   } catch (err) {
//     console.error("deleteDailyTask error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// controllers/dailyTaskController.js
const mongoose = require("mongoose");
const moment = require("moment");
const DailyTask = require("../models/DailyTask");

// Create a new daily task
exports.createDailyTask = async (req, res) => {
  try {
    const payload = req.body || {};
    // default status to "Created" if omitted
    if (!payload.status) payload.status = "Created";

    // Validate and format taskDate
    if (payload.taskDate) {
      if (!moment(payload.taskDate, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({
          success: false,
          message: "taskDate must be in YYYY-MM-DD format",
        });
      }
      payload.taskDate = moment(payload.taskDate, "YYYY-MM-DD")
        .startOf("day")
        .toDate();
    } else {
      // Set default taskDate to today if not provided
      payload.taskDate = moment().startOf("day").toDate();
    }

    const task = await DailyTask.create(payload);
    const populated = await DailyTask.findById(task._id).populate(
      "vendorId",
      "name email"
    );
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createDailyTask error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Get all daily tasks (optionally filter by status or date)
exports.getAllDailyTasks = async (req, res) => {
  try {
    const { status, date } = req.query;
    const q = {};

    if (status) q.status = status;

    // Filter by taskDate if provided
    if (date) {
      if (!moment(date, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({
          success: false,
          message: "Date parameter must be in YYYY-MM-DD format",
        });
      }

      const startDate = moment(date, "YYYY-MM-DD").startOf("day").toDate();
      const endDate = moment(date, "YYYY-MM-DD").endOf("day").toDate();

      q.taskDate = { $gte: startDate, $lte: endDate };
    }

    const tasks = await DailyTask.find(q)
      .sort({ taskDate: -1, createdAt: -1 })
      .populate("vendorId", "name email");

    return res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("getAllDailyTasks error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Get tasks by a calendar date (DD-MM-YYYY) based on taskDate
exports.getDailyTaskByDate = async (req, res) => {
  try {
    const { date } = req.query; // Expected format: "DD-MM-YYYY"

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required (format: DD-MM-YYYY)",
      });
    }

    // Validate date format
    if (!moment(date, "DD-MM-YYYY", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use DD-MM-YYYY format",
      });
    }

    // Parse the date string (DD-MM-YYYY)
    const [day, month, year] = date.split("-").map(Number);

    // Create start and end of the day
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Find tasks where taskDate matches the requested date
    const tasks = await DailyTask.find({
      taskDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (err) {
    console.error("getDailyTaskByDate error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// Get tasks by date range
exports.getDailyTasksByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Expected format: "YYYY-MM-DD"

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate parameters are required (format: YYYY-MM-DD)",
      });
    }

    // Validate date formats
    if (
      !moment(startDate, "YYYY-MM-DD", true).isValid() ||
      !moment(endDate, "YYYY-MM-DD", true).isValid()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }

    // Create date range
    const start = moment(startDate, "YYYY-MM-DD").startOf("day").toDate();
    const end = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();

    // Find tasks within the date range
    const tasks = await DailyTask.find({
      taskDate: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("vendorId", "name email")
      .sort({ taskDate: 1, createdAt: -1 });

    return res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (err) {
    console.error("getDailyTasksByDateRange error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// Get single task by ID
exports.getDailyTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const task = await DailyTask.findById(id).populate(
      "vendorId",
      "name email"
    );
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, data: task });
  } catch (err) {
    console.error("getDailyTaskById error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Update task status with reschedule logic
exports.updateTaskStatus = async (req, res) => {
  try {
    // Match the param used in the router (':id')
    const { id } = req.params;           // <-- FIXED
    const { status, rescheduleDate } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const task = await DailyTask.findById(id);  // <-- FIXED
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Allow any change from Completed
    if (task.status === "Completed") {
      task.status = status;
      await task.save();
      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        task,
      });
    }

    // Move to Completed from Created/Pending
    if (status === "Completed") {
      task.status = status;
      await task.save();
      return res.status(200).json({
        success: true,
        message: "Task marked as completed",
        task,
      });
    }

    // Move to Pending with required reschedule date
    if (status === "Pending") {
      if (!rescheduleDate) {
        return res.status(400).json({
          success: false,
          message:
            "Reschedule date is required when setting status to Pending",
        });
      }

      // Normalize the incoming date to a valid Date
      const d = new Date(rescheduleDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid reschedule date",
        });
      }

      task.status = status;
      task.taskDate = d;
      await task.save();
      return res.status(200).json({
        success: true,
        message: "Task rescheduled successfully",
        task,
      });
    }

    // Other transitions (e.g., Created <-> Pending with date already set elsewhere)
    task.status = status;
    await task.save();
    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Delete task
exports.deleteDailyTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const deleted = await DailyTask.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("deleteDailyTask error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
