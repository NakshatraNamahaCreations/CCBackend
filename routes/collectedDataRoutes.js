// routes/collectedDataRoutes.js
const express = require("express");
const router = express.Router();
const { addOrUpdateEventData, getCollectedDataByQuotation, updateEditingStatus, getCollectedDataList, getCollectedDataById } = require("../Controllers/collectedDataController");

router.post("/", addOrUpdateEventData);
router.get("/", getCollectedDataList); // ✅ New list API
router.get("/:quotationId", getCollectedDataByQuotation);
router.put("/update-status", updateEditingStatus);
router.get("/details/:id", getCollectedDataById);
module.exports = router;
