const express = require("express");
const router = express.Router();
const { submitVendorProgress, getSubmissionsByAssignment } = require("../Controllers/vendorSubmissionController");

router.post("/submit-vendor-progress", submitVendorProgress);
router.get("/:assignmentId", getSubmissionsByAssignment);

module.exports = router;
