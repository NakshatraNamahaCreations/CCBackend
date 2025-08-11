const mongoose = require("mongoose");
const CollectedData = require("../models/collectedData");

exports.addOrUpdateEventData = async (req, res) => {
  try {
    const {
      quotationId,
      quotationUniqueId,
      personName,
      systemNumber,
      eventId,
      eventName,
      cameraName,
      totalDriveSize,
      filledSize,
      copyingPerson,
      copiedLocation,
      noOfPhotos,
      noOfVideos,
      submissionDate,
      notes,
    } = req.body;

    const qId = new mongoose.Types.ObjectId(quotationId);
    const evId = new mongoose.Types.ObjectId(eventId);

    let collectedData = await CollectedData.findOne({ quotationId: qId });

    if (!collectedData) {
      collectedData = new CollectedData({
        quotationId: qId,
        quotationUniqueId,
        personName,
        systemNumber,
        immutableLock: true,
        events: [
          {
            eventId: evId,
            eventName,
            cameraName,
            totalDriveSize,
            filledSize,
            copyingPerson,
            copiedLocation,
            noOfPhotos,
            noOfVideos,
            submissionDate,
            notes,
            editingStatus: "Pending",
          },
        ],
      });
    } else {
      if (collectedData.immutableLock) {
        if (
          collectedData.personName !== personName ||
          collectedData.systemNumber !== systemNumber
        ) {
          return res.status(400).json({
            success: false,
            message: "Person name or System number cannot be changed once set.",
          });
        }
      }

      const eventIndex = collectedData.events.findIndex(
        (e) => e.eventId && e.eventId.toString() === eventId
      );

      if (eventIndex > -1) {
        collectedData.events[eventIndex] = {
          ...collectedData.events[eventIndex].toObject(),
          eventName,
          cameraName,
          totalDriveSize,
          filledSize,
          copyingPerson,
          copiedLocation,
          noOfPhotos,
          noOfVideos,
          submissionDate,
          notes,
          editingStatus: collectedData.events[eventIndex].editingStatus, // Preserve existing status
        };
      } else {
        collectedData.events.push({
          eventId: evId,
          eventName,
          cameraName,
          totalDriveSize,
          filledSize,
          copyingPerson,
          copiedLocation,
          noOfPhotos,
          noOfVideos,
          submissionDate,
          notes,
          editingStatus: "Pending",
        });
      }
    }

    await collectedData.save();
    return res.status(200).json({ success: true, data: collectedData });
  } catch (error) {
    console.error("Error saving collected data:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateEditingStatus = async (req, res) => {
  const { quotationId, eventId, status } = req.body;
  const data = await CollectedData.findOneAndUpdate(
    { quotationId, "events.eventId": eventId },
    { $set: { "events.$.editingStatus": status } },
    { new: true }
  );
  res.json({ success: true, data });
};

// Fetch collected data for a quotation
exports.getCollectedDataByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const data = await CollectedData.findOne({ quotationId });

    if (!data) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCollectedDataList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      $or: [
        { quotationUniqueId: { $regex: search, $options: "i" } },
        { personName: { $regex: search, $options: "i" } },
      ],
    };

    const total = await CollectedData.countDocuments(query);
    const data = await CollectedData.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching collected data list:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Fetch collected data by its document ID
exports.getCollectedDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const collectedData = await CollectedData.findById(id);

    if (!collectedData) {
      return res.status(404).json({
        success: false,
        message: "Collected data not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: collectedData,
    });
  } catch (error) {
    console.error("Error fetching collected data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching collected data",
    });
  }
};



