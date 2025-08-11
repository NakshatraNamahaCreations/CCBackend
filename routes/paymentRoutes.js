const express = require("express");
const router = express.Router();
const { getCompletedInstallments } = require("../Controllers/paymentController");

router.get("/completed", getCompletedInstallments);

module.exports = router;
