const express = require("express");
const { createExpense, getExpenses } = require("../Controllers/otherExpenseController.js");

const router = express.Router();

router.post("/", createExpense);
router.get("/", getExpenses);

module.exports = router;  