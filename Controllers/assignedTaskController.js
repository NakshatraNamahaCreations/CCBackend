// const AssignedTask = require('../models/assignedTask');
// const Vendor = require('../models/vendor.model');

// exports.assignTask = async (req, res) => {
//   console.log("Request:", req.body);

//   const {
//     quotationId,
//     eventId,
//     eventName,
//     serviceName,
//     totalPhotos,
//     totalVideos,
//     assignments
//   } = req.body;

//   if (
//     !quotationId ||
//     !eventId ||
//     !eventName ||
//     !serviceName ||
//     !assignments ||
//     !Array.isArray(assignments) ||
//     assignments.length === 0
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: 'All required fields must be provided and assignments must be a non-empty array.',
//     });
//   }

//   try {
//     let assignedTask = await AssignedTask.findOne({ quotationId, eventId, serviceName });

//     if (assignedTask) {
//       // ✅ Merge new assignments instead of overwriting
//       assignedTask.totalPhotos = totalPhotos ?? assignedTask.totalPhotos;
//       assignedTask.totalVideos = totalVideos ?? assignedTask.totalVideos;

//       assignedTask.assignments.push(...assignments);
//       await assignedTask.save();
//     } else {
//       // ✅ Create new task
//       assignedTask = await AssignedTask.create({
//         quotationId,
//         eventId,
//         eventName,
//         serviceName,
//         totalPhotos,
//         totalVideos,
//         assignments
//       });
//     }

//     // ✅ Mark all assigned vendors as Not Available
//     const vendorIds = assignments.map(a => a.vendorId);
//     await Vendor.updateMany(
//       { _id: { $in: vendorIds } },
//       { $set: { status: 'Not Available' } }
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Task assigned and vendor status updated successfully',
//       data: assignedTask
//     });

//   } catch (error) {
//     console.error('Error assigning task:', error);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getOverallCounts = async (req, res) => {
//   const { quotationId, eventId } = req.query;

//   if (!quotationId || !eventId) {
//     return res.status(400).json({
//       success: false,
//       message: "quotationId and eventId are required",
//     });
//   }

//   try {
//     const assignedTasks = await AssignedTask.find({ quotationId, eventId });

//     if (!assignedTasks.length) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           totalPhotos: 0,
//           totalVideos: 0,
//           assignedPhotos: 0,
//           assignedVideos: 0,
//           remainingPhotos: 0,
//           remainingVideos: 0,
//         },
//       });
//     }

//     const totalPhotos = assignedTasks.reduce((sum, t) => sum + (t.totalPhotos || 0), 0);
//     const totalVideos = assignedTasks.reduce((sum, t) => sum + (t.totalVideos || 0), 0);
//     const assignedPhotos = assignedTasks.reduce((sum, t) => sum + (t.assignedPhotos || 0), 0);
//     const assignedVideos = assignedTasks.reduce((sum, t) => sum + (t.assignedVideos || 0), 0);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalPhotos,
//         totalVideos,
//         assignedPhotos,
//         assignedVideos,
//         remainingPhotos: totalPhotos - assignedPhotos,
//         remainingVideos: totalVideos - assignedVideos,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching overall counts:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// // Get detailed assignment counts for a specific event/service
// exports.getAssignmentCounts = async (req, res) => {
//   const { quotationId, eventId, serviceName } = req.query;

//   if (!quotationId || !eventId || !serviceName) {
//     return res.status(400).json({
//       success: false,
//       message: "quotationId, eventId, and serviceName are required",
//     });
//   }

//   try {
//     const assignedTask = await AssignedTask.findOne({
//       quotationId,
//       eventId,
//       serviceName,
//     });

//     if (!assignedTask) {
//       return res.status(404).json({
//         success: false,
//         message: "Assigned task not found",
//       });
//     }

//     const {
//       totalPhotos,
//       totalVideos,
//       remainingPhotosToAssign,
//       remainingVideosToAssign,
//       assignments,
//     } = assignedTask;

//     // ✅ Vendor-wise breakdown
//     const vendorAssignments = assignments.map((a) => ({
//       vendorName: a.vendorName,
//       photosAssigned: a.photosAssigned,
//       videosAssigned: a.videosAssigned,
//     }));

//     // ✅ Total assigned counts
//     const assignedPhotos = assignments.reduce((sum, a) => sum + (a.photosAssigned || 0), 0);
//     const assignedVideos = assignments.reduce((sum, a) => sum + (a.videosAssigned || 0), 0);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalPhotos,
//         totalVideos,
//         assignedPhotos,
//         assignedVideos,
//         remainingPhotosToAssign: (totalPhotos || 0) - assignedPhotos,
//         remainingVideosToAssign: (totalVideos || 0) - assignedVideos,
//         vendorAssignments
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching assignment counts:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const AssignedTask = require("../models/assignedTask");
const Vendor = require("../models/vendor.model");
const mongoose = require("mongoose");


exports.assignTask = async (req, res) => {
  try {
    const {
      quotationId,
      eventId,
      eventName,
      totalPhotos,
      totalVideos,
      assignments,
    } = req.body;

    if (
      !quotationId ||
      !eventId ||
      !eventName ||
      !assignments ||
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided and assignments must be a non-empty array.",
      });
    }

    const newPhotosAssigned = assignments.reduce(
      (sum, a) => sum + (a.photosAssigned || 0),
      0
    );
    const newVideosAssigned = assignments.reduce(
      (sum, a) => sum + (a.videosAssigned || 0),
      0
    );

    let assignedTask = await AssignedTask.findOne({ quotationId, eventId });

    if (assignedTask) {
      // ✅ There is already an assignment → use remaining counts
      const remainingPhotos = assignedTask.remainingPhotosToAssign || 0;
      const remainingVideos = assignedTask.remainingVideosToAssign || 0;

      if (newPhotosAssigned > remainingPhotos) {
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${newPhotosAssigned} photos. Remaining count is ${remainingPhotos}.`,
        });
      }
      if (newVideosAssigned > remainingVideos) {
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${newVideosAssigned} videos. Remaining count is ${remainingVideos}.`,
        });
      }

      assignedTask.assignments.push(...assignments);

      assignedTask.assignedPhotos += newPhotosAssigned;
      assignedTask.assignedVideos += newVideosAssigned;

      assignedTask.remainingPhotosToAssign =
        (assignedTask.remainingPhotosToAssign ?? assignedTask.totalPhotos) - newPhotosAssigned;
      assignedTask.remainingVideosToAssign =
        (assignedTask.remainingVideosToAssign ?? assignedTask.totalVideos) - newVideosAssigned;

      assignedTask.totalPhotos = assignedTask.totalPhotos || totalPhotos;
      assignedTask.totalVideos = assignedTask.totalVideos || totalVideos;

      await assignedTask.save();
    } else {
      // ✅ First-time assignment → validate against total
      if (newPhotosAssigned > totalPhotos) {
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${newPhotosAssigned} photos. Total available is ${totalPhotos}.`,
        });
      }
      if (newVideosAssigned > totalVideos) {
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${newVideosAssigned} videos. Total available is ${totalVideos}.`,
        });
      }

      assignedTask = await AssignedTask.create({
        quotationId,
        eventId,
        eventName,
        totalPhotos,
        totalVideos,
        assignedPhotos: newPhotosAssigned,
        assignedVideos: newVideosAssigned,
        remainingPhotosToAssign: (totalPhotos || 0) - newPhotosAssigned,
        remainingVideosToAssign: (totalVideos || 0) - newVideosAssigned,
        assignments,
      });
    }

    // ✅ Update vendor status
    for (const assignment of assignments) {
      await Vendor.findByIdAndUpdate(
        assignment.vendorId,
        { status: "Not Available" },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data: assignedTask,
    });
  } catch (error) {
    console.error("Error assigning task:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getOverallCounts = async (req, res) => {
  const { quotationId, eventId } = req.query;

  if (!quotationId || !eventId) {
    return res.status(400).json({
      success: false,
      message: "quotationId and eventId are required",
    });
  }

  try {
    // ✅ First, get base totalPhotos & totalVideos from CollectedData
    const collectedData = await CollectedData.findOne(
      { quotationId, "events.eventId": eventId },
      { "events.$": 1 } // fetch only the matching event
    );

    if (!collectedData) {
      return res.status(404).json({
        success: false,
        message: "Event data not found in collected data",
      });
    }

    const eventData = collectedData.events[0];
    const totalPhotos = eventData.noOfPhotos || 0;
    const totalVideos = eventData.noOfVideos || 0;

    // ✅ Check if there are any tasks assigned
    const tasks = await AssignedTask.find({ quotationId, eventId });

    if (!tasks.length) {
      // If no tasks yet → total = remaining = base event counts
      return res.status(200).json({
        success: true,
        data: {
          totalPhotos,
          totalVideos,
          assignedPhotos: 0,
          assignedVideos: 0,
          remainingPhotosToAssign: totalPhotos,
          remainingVideosToAssign: totalVideos,
        },
      });
    }

    // ✅ If tasks exist, calculate assigned counts
    const assignedPhotos = tasks.reduce(
      (sum, task) => sum + (task.assignedPhotos || 0),
      0
    );
    const assignedVideos = tasks.reduce(
      (sum, task) => sum + (task.assignedVideos || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalPhotos,
        totalVideos,
        assignedPhotos,
        assignedVideos,
        remainingPhotosToAssign: Math.max(totalPhotos - assignedPhotos, 0),
        remainingVideosToAssign: Math.max(totalVideos - assignedVideos, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching overall counts:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// GET /api/assignments/:eventId/:serviceName
exports.getAssignmentsByEventAndService = async (req, res) => {
  try {
    const { eventId, serviceName } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid eventId" });
    }

    const assignments = await AssignedTask.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      { $unwind: "$assignments" },
      { $match: { "assignments.serviceName": serviceName } },
      {
        $project: {
          _id: "$assignments._id",
          quotationId: 1,
          eventId: 1,
          eventName: 1,
          serviceName: "$assignments.serviceName",
          vendorId: "$assignments.vendorId",
          vendorName: "$assignments.vendorName",
          taskDate: "$assignments.taskDate",
          taskDescription: "$assignments.taskDescription",
          completionDate: "$assignments.completionDate",
          photosAssigned: "$assignments.photosAssigned",
          videosAssigned: "$assignments.videosAssigned",
        //   photosEdited: "$assignments.photosEdited",
        //   videosEdited: "$assignments.videosEdited",
          editComment: "$assignments.editComment",
          status: "$assignments.status",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};




exports.getAssignedCounts = async (req, res) => {
  try {
    const { quotationId, eventId } = req.query;

    if (!quotationId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "quotationId and eventId are required",
      });
    }

    // ✅ Fetch only assignedPhotos and assignedVideos
    const taskCounts = await AssignedTask.findOne(
      { quotationId, eventId },
      { assignedPhotos: 1, assignedVideos: 1, _id: 0 } // projection
    );

    if (!taskCounts) {
      return res.status(404).json({
        success: false,
        message: "No assigned tasks found for this event",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assignedPhotos: taskCounts.assignedPhotos || 0,
        assignedVideos: taskCounts.assignedVideos || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned counts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};