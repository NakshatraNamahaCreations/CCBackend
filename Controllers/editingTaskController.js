const EditingTask = require("../models/editingTask");
const mongoose = require("mongoose");

// ✅ Assign a new editing task
exports.assignEditingTask = async (req, res) => {
  try {
    const {
      quotationId,
      collectedDataId,
      serviceUnitId,
      packageId,
      packageName,
      serviceName,
      vendorId,
      vendorName,
      taskDescription,
      noOfPhotos = 0,
      noOfVideos = 0,
      dueDate,
    } = req.body;

    // Validation
    if (
      !quotationId ||
      !collectedDataId ||
      !serviceUnitId ||
      !packageId ||
      !packageName ||
      !serviceName ||
      !vendorId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "quotationId, collectedDataId, serviceUnitId, packageId, packageName, serviceName and vendorId are required.",
      });
    }

    const newTask = new EditingTask({
      quotationId,
      collectedDataId,
      serviceUnitId,
      packageId,
      packageName,
      serviceName,
      vendorId,
      vendorName,
      taskDescription,
      noOfPhotos,
      noOfVideos,
      completionDate: dueDate ? new Date(dueDate) : undefined,
    });

    await newTask.save();

    res.status(201).json({
      success: true,
      message: "Editing task assigned successfully.",
      task: newTask,
    });
  } catch (err) {
    console.error("Error assigning editing task:", err);
    res.status(500).json({
      success: false,
      message: "Failed to assign editing task.",
      error: err.message,
    });
  }
};

// ✅ Submit (complete) an editing task
exports.submitEditingTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { submittedNotes , submittedDate} = req.body;

    if (!taskId)
      return res
        .status(400)
        .json({ success: false, message: "Task ID is required." });

    const task = await EditingTask.findById(taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Editing task not found." });

    task.status = "Completed";
    task.submittedNotes = submittedNotes || "";
    task.submittedDate = submittedDate;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Editing task submitted successfully.",
      task,
    });
  } catch (err) {
    console.error("Error submitting editing task:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit editing task.",
      error: err.message,
    });
  }
};

// ✅ Get single task by ID (optional)
exports.getEditingTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await EditingTask.findById(taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Editing task not found." });

    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch editing task.",
      error: err.message,
    });
  }
};


// Add this to your editing task controller
exports.getEditingTasksByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    
    if (!quotationId) {
      return res.status(400).json({
        success: false,
        message: "Quotation ID is required"
      });
    }

    const tasks = await EditingTask.find({ quotationId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks
    });
  } catch (err) {
    console.error("Error fetching editing tasks:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch editing tasks",
      error: err.message
    });
  }
};

