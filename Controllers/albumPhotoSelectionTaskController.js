// Controllers/albumPhotoSelectionTaskController.js
const AlbumPhotoSelectionTask = require("../models/albumPhotoSelectionTask");

// ✅ Create Album Photo Selection Task
exports.createAlbumPhotoSelectionTask = async (req, res) => {
  try {
    const {
      quotationId,
      albumId,
      templateLabel,
      baseSheets,
      basePhotos,
      vendorId,
      vendorName,
      taskDescription,
      assignedDate,
      photosToSelect
    } = req.body;

    if (!quotationId || !albumId || !templateLabel || !vendorId || !vendorName || !assignedDate || !photosToSelect) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields."
      });
    }

    const newTask = new AlbumPhotoSelectionTask({
      quotationId,
      albumId,
      templateLabel,
      baseSheets,
      basePhotos,
      vendorId,
      vendorName,
      taskDescription,
      assignedDate,
      photosToSelect
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      success: true,
      message: "Album photo selection task created successfully.",
      task: savedTask
    });
  } catch (error) {
    console.error("Error creating album photo selection task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task.",
      error: error.message
    });
  }
};

// ✅ Fetch tasks by albumId (return latest first + a quick boolean for convenience)
exports.getAlbumPhotoSelectionByAlbumId = async (req, res) => {
  try {
    const { albumId } = req.params;
    if (!albumId) {
      return res.status(400).json({ success: false, message: "albumId is required." });
    }

    const tasks = await AlbumPhotoSelectionTask
      .find({ albumId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      hasTask: tasks.length > 0,
      latestTask: tasks[0] || null,
      tasks
    });
  } catch (error) {
    console.error("Error fetching album photo selection task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks.",
      error: error.message
    });
  }
};
