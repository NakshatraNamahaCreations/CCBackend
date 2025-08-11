const AssignedTask = require("../models/assignedTask");
const VendorSubmission = require("../models/VendorSubmission")

const mongoose = require("mongoose");

exports.submitVendorProgress = async (req, res) => {
  try {
    const {
      assignmentId,
      vendorId,
      vendorName,
      photosEdited = 0,
      videosEdited = 0,
      comment = "",
    } = req.body;

    if (!assignmentId || !vendorId || !vendorName) {
      return res.status(400).json({
        success: false,
        message: "assignmentId, vendorId, and vendorName are required.",
      });
    }

    // ✅ Convert assignmentId to ObjectId
    const assignmentObjectId = new mongoose.Types.ObjectId(assignmentId);

    // ✅ Find AssignedTask containing this assignment
    const task = await AssignedTask.findOne({ "assignments._id": assignmentObjectId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Assigned task not found.",
      });
    }

    // ✅ Locate the specific vendor assignment
    const vendorTask = task.assignments.id(assignmentObjectId);
    if (!vendorTask) {
      return res.status(404).json({
        success: false,
        message: "Vendor assignment not found in this task.",
      });
    }

    // ✅ Existing submissions for this vendor
    const existingSubmission = await VendorSubmission.findOne({
      assignmentId: assignmentObjectId,
      vendorId,
    });

    const prevPhotos = existingSubmission
      ? existingSubmission.submissions.reduce((sum, s) => sum + (s.photosEdited || 0), 0)
      : 0;

    const prevVideos = existingSubmission
      ? existingSubmission.submissions.reduce((sum, s) => sum + (s.videosEdited || 0), 0)
      : 0;

    const totalPhotosEdited = prevPhotos + photosEdited;
    const totalVideosEdited = prevVideos + videosEdited;

    // ✅ Validation: do not exceed assigned count
    if (totalPhotosEdited > vendorTask.photosAssigned) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit ${photosEdited} photos. Remaining limit is ${
          vendorTask.photosAssigned - prevPhotos
        }.`,
      });
    }
    if (totalVideosEdited > vendorTask.videosAssigned) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit ${videosEdited} videos. Remaining limit is ${
          vendorTask.videosAssigned - prevVideos
        }.`,
      });
    }

    // ✅ Add or update VendorSubmission
    const submission = await VendorSubmission.findOneAndUpdate(
      { assignmentId: assignmentObjectId, vendorId },
      {
        vendorName,
        $push: {
          submissions: {
            photosEdited,
            videosEdited,
            comment,
          },
        },
      },
      { new: true, upsert: true }
    );

    // ✅ Update counts in AssignedTask
    vendorTask.photosEdited = totalPhotosEdited;
    vendorTask.videosEdited = totalVideosEdited;

    task.photosEdited = task.assignments.reduce((sum, a) => sum + (a.photosEdited || 0), 0);
    task.videosEdited = task.assignments.reduce((sum, a) => sum + (a.videosEdited || 0), 0);

    // ✅ Mark completed if fully submitted
    if (
      vendorTask.photosEdited >= vendorTask.photosAssigned &&
      vendorTask.videosEdited >= vendorTask.videosAssigned
    ) {
      vendorTask.status = "Completed";
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Vendor submission recorded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error submitting vendor progress:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required.",
      });
    }

    // ✅ Find all submissions for this assignment
    const submissions = await VendorSubmission.find({ assignmentId })
      .populate("vendorId", "name email") // populate vendor info
      .sort({ createdAt: -1 });

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message: "No submissions found for this assignment.",
      });
    }

    // ✅ Flatten the structure for easier frontend rendering
    const formattedData = submissions.map((sub) => ({
      vendorId: sub.vendorId._id,
      vendorName: sub.vendorName || sub.vendorId.name,
      submissions: sub.submissions.map((detail) => ({
        submissionDate: detail.submissionDate,
        photosEdited: detail.photosEdited,
        videosEdited: detail.videosEdited,
        comment: detail.comment,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};