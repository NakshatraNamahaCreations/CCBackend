const VideoEditingTask = require("../models/videoEditingTask");

// 🎥 Assign Video Editing Task
exports.assignVideoEditingTask = async (req, res) => {
  try {
    const {
      quotationId,
      collectedDataId,
      // packageId,
      packageName,
      serviceName,
      vendorId,
      vendorName,
      taskDescription,
      totalClipsAssigned,
      finalVideoDuration,
      completionDate,
    } = req.body;

    if (!totalClipsAssigned || totalClipsAssigned <= 0)
      return res
        .status(400)
        .json({ success: false, message: "totalClipsAssigned is required" });

    const newTask = await VideoEditingTask.create({
      quotationId,
      collectedDataId,
      // packageId,
      packageName,
      serviceName,
      vendorId,
      vendorName,
      taskDescription,
      totalClipsAssigned,
      finalVideoDuration,
      completionDate,
    });

    res.status(201).json({ success: true, message: "Video Editing Task Assigned", task: newTask });
  } catch (err) {
    console.error("Error assigning video editing task:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🎥 Submit Video Editing Task
exports.submitVideoEditingTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { submittedDate, submittedNotes } = req.body;

    const task = await VideoEditingTask.findById(id);
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    task.status = "Completed";
    task.submittedDate = submittedDate || new Date();
    task.submittedNotes = submittedNotes || "";
    await task.save();

    res.json({ success: true, message: "Video Editing Task Submitted", task });
  } catch (err) {
    console.error("Error submitting video editing task:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🎥 Fetch All Video Editing Tasks
exports.getAllVideoEditingTasks = async (req, res) => {
  try {
    const tasks = await VideoEditingTask.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error("Error fetching video editing tasks:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🎥 Fetch Single Video Editing Task by ID
exports.getVideoEditingTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await VideoEditingTask.findById(id);
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, task });
  } catch (err) {
    console.error("Error fetching video editing task:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🎥 Fetch Tasks by Quotation ID
exports.getVideoEditingTasksByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const tasks = await VideoEditingTask.find({ quotationId }).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error("Error fetching video tasks by quotation:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
