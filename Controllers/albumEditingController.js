const mongoose = require("mongoose");
const AlbumEditingTask = require("../models/albumEditingTask");
const Quotation = require("../models/quotation.model");

exports.assignAlbumEditingTask = async (req, res) => {
  try {
    const {
      quotationId,
      albumId,
      albumDetails, // { templateLabel, baseSheets, basePhotos, boxLabel, qty, unitPrice }
      selectedPhotos = 0,
      vendorId,
      vendorName = "",
      taskDescription = "",
    } = req.body;

    if (!quotationId || !albumId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "quotationId, albumId and vendorId are required.",
      });
    }

    // 1) Fetch the specific album (projection returns only the matched album)
    const qDoc = await Quotation.findOne(
      { _id: quotationId, "albums._id": albumId },
      { "albums.$": 1 } // only the matched album
    ).lean();

    if (!qDoc || !qDoc.albums || qDoc.albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quotation or Album not found.",
      });
    }

    const album = qDoc.albums[0];

    // Prefer body-provided details; else derive a sensible snapshot from the album
    const albumSnapshot =
      albumDetails && Object.keys(albumDetails).length > 0
        ? albumDetails
        : {
            templateLabel: album?.snapshot?.templateLabel,
            baseSheets: album?.snapshot?.baseSheets,
            basePhotos: album?.snapshot?.basePhotos,
            boxLabel: album?.snapshot?.boxLabel,
            qty: album?.qty,
            unitPrice: album?.unitPrice,
          };

    // 2) Create the editing task
    let task;
    try {
      task = await AlbumEditingTask.create({
        quotationId,
        albumId,
        albumSnapshot,
        selectedPhotos,
        vendorId,
        vendorName,
        taskDescription,
        status: "Assigned",
        assignedDate: new Date(),
      });
    } catch (err) {
      // Task creation failed
      console.error("AlbumEditingTask.create error:", err);
      return res.status(500).json({
        success: false,
        message: "Could not create album editing task.",
        error: err.message,
      });
    }

    // 3) Mark the album as "In Progress"
    try {
      const upd = await Quotation.updateOne(
        { _id: quotationId, "albums._id": albumId },
        { $set: { "albums.$.status": "In Progress" } }
      );

      if (!upd || upd.modifiedCount !== 1) {
        // Roll back the created task to keep data consistent
        try {
          await AlbumEditingTask.deleteOne({ _id: task._id });
        } catch (rollbackErr) {
          console.error("Rollback delete task failed:", rollbackErr);
        }
        return res.status(500).json({
          success: false,
          message: "Failed to update album status to In Progress.",
        });
      }
    } catch (err) {
      // Roll back the created task to keep data consistent
      try {
        await AlbumEditingTask.deleteOne({ _id: task._id });
      } catch (rollbackErr) {
        console.error("Rollback delete task failed:", rollbackErr);
      }
      console.error("Quotation.updateOne error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while updating album status.",
        error: err.message,
      });
    }

    // 4) Success
    return res.status(201).json({
      success: true,
      message:
        "Album editing task assigned successfully and album marked In Progress.",
      task,
    });
  } catch (err) {
    console.error("assignAlbumEditingTask error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error assigning album editing task.",
      error: err.message,
    });
  }
};

exports.getAlbumEditingTasksByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const tasks = await AlbumEditingTask.find({ quotationId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, tasks });
  } catch (err) {
    console.error("getAlbumEditingTasksByQuotation error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: err.message });
  }
};

exports.getAlbumEditingTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await AlbumEditingTask.findById(taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    return res.json({ success: true, task });
  } catch (err) {
    console.error("getAlbumEditingTask error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: err.message });
  }
};

exports.getLatestAlbumTaskByAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const task = await AlbumEditingTask.findOne({ albumId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, task: task || null });
  } catch (err) {
    console.error("getLatestAlbumTaskByAlbum error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: err.message });
  }
};
