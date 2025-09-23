const express = require("express");
const router = express.Router();
const {
  saveSortedData,
  updateServiceUnitSortedData,
  getSortedDataByQuotation,
} = require("../Controllers/sortedDataController");

// Create or Update entire sortedData
router.post("/", saveSortedData);

// Update one service unit inside sortedData
router.put("/:id/service-unit/:unitId", updateServiceUnitSortedData);

// Fetch by quotationId
router.get("/quotation/:quotationId", getSortedDataByQuotation);

module.exports = router;
