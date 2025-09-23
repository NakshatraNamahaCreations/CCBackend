// // routes/collectedDataRoutes.js
// const express = require("express");
// const router = express.Router();
// const { addOrUpdateEventData, getCollectedDataByQuotation, updateEditingStatus, getCollectedDataList, getCollectedDataById } = require("../Controllers/collectedDataController");

// router.post("/", addOrUpdateEventData);
// router.put(
//     "/:collectedDataId/events/:eventId/status",
//     updateEditingStatus
//   );

// router.get("/", getCollectedDataList); // ✅ New list API
// router.get("/:quotationId", getCollectedDataByQuotation);
// // router.put("/update-status", updateEditingStatus);
// router.get("/details/:id", getCollectedDataById);
// module.exports = router;



// routes/collectedDataRoutes.js
const express = require("express");
const router = express.Router();
const {
  addOrUpdateServiceUnitData,
  getCollectedDataByQuotation,
  updateServiceUnitEditingStatus,
  getCollectedDataList,
  getCollectedDataById,
  getServiceUnitById
} = require("../Controllers/collectedDataController");

// Create/Update a single service unit
router.post("/", addOrUpdateServiceUnitData);

// Update editing status of a specific service unit
// Body: { packageId, serviceId, unitIndex, status | newStatus }
router.put("/:collectedDataId/service-unit/status", updateServiceUnitEditingStatus);

// List with pagination and search
router.get("/", getCollectedDataList);

// IMPORTANT: Put the more specific route BEFORE the param route to avoid conflicts
router.get("/details/:id", getCollectedDataById);
router.get(
  "/:collectedId/service-unit/:unitId",
  getServiceUnitById
);

// Fetch by quotationId
router.get("/:quotationId", getCollectedDataByQuotation);

module.exports = router;