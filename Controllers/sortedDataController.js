const SortedData = require("../models/sortedData.js");

// ➤ Create or Update SortedData for a quotation
exports.saveSortedData = async (req, res) => {
  try {
    const { quotationId, quotationUniqueId, collectedDataId, serviceUnits } = req.body;

    if (!quotationId || !quotationUniqueId || !collectedDataId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // find existing by quotation
    let sortedData = await SortedData.findOne({ quotationId });

    if (sortedData) {
      // Update serviceUnits
      serviceUnits.forEach((unit) => {
        const idx = sortedData.serviceUnits.findIndex(
          (u) => u.serviceUnitId.toString() === unit.serviceUnitId
        );

        if (idx > -1) {
          // Update existing
          sortedData.serviceUnits[idx].sortedPhotos =
            unit.sortedPhotos ?? sortedData.serviceUnits[idx].sortedPhotos;
          sortedData.serviceUnits[idx].sortedVideos =
            unit.sortedVideos ?? sortedData.serviceUnits[idx].sortedVideos;
        } else {
          // Push new
          sortedData.serviceUnits.push({
            serviceUnitId: unit.serviceUnitId,
            packageName: unit.packageName,
            serviceName: unit.serviceName,
            sortedPhotos: unit.sortedPhotos || 0,
            sortedVideos: unit.sortedVideos || 0,
          });
        }
      });
    } else {
      // create new
      sortedData = new SortedData({
        quotationId,
        quotationUniqueId,
        collectedDataId,
        serviceUnits: serviceUnits.map((u) => ({
          serviceUnitId: u.serviceUnitId,
          packageName: u.packageName,
          serviceName: u.serviceName,
          sortedPhotos: u.sortedPhotos || 0,
          sortedVideos: u.sortedVideos || 0,
        })),
      });
    }

    // ✅ Recalculate totals before saving
    sortedData.totalSortedPhotos = sortedData.serviceUnits.reduce(
      (sum, u) => sum + (u.sortedPhotos || 0),
      0
    );
    sortedData.totalSortedVideos = sortedData.serviceUnits.reduce(
      (sum, u) => sum + (u.sortedVideos || 0),
      0
    );

    await sortedData.save();

    res.json({ success: true, data: sortedData });
  } catch (err) {
    console.error("Error saving sorted data:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ➤ Update specific service unit sorted data
exports.updateServiceUnitSortedData = async (req, res) => {
  try {
    const { id, unitId } = req.params; // SortedData ID and ServiceUnit ID
    const { sortedPhotos, sortedVideos } = req.body;

    const sortedData = await SortedData.findById(id);
    if (!sortedData) {
      return res.status(404).json({ success: false, message: "SortedData not found" });
    }

    const unit = sortedData.serviceUnits.find(
      (u) => u.serviceUnitId.toString() === unitId
    );
    if (!unit) {
      return res.status(404).json({ success: false, message: "ServiceUnit not found" });
    }

    if (sortedPhotos !== undefined) unit.sortedPhotos = sortedPhotos;
    if (sortedVideos !== undefined) unit.sortedVideos = sortedVideos;

    await sortedData.save();

    res.json({ success: true, data: sortedData });
  } catch (err) {
    console.error("Error updating service unit:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ Get sorted data by quotationId
exports.getSortedDataByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const sortedData = await SortedData.findOne({ quotationId });
    if (!sortedData) {
      return res.status(404).json({ success: false, message: "No sorted data found" });
    }
    res.json({ success: true, data: sortedData });
  } catch (err) {
    console.error("Error fetching sorted data:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
