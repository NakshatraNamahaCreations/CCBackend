// routes/followUpRoutes.js
const express = require('express');
const router = express.Router();
const followUpController = require('../Controllers/followUpController');

// Get all quotations needing follow-up
router.get('/', followUpController.getFollowUpQuotations);

// Get count of pending follow-ups
router.get('/count', followUpController.getFollowUpCount);

// Mark follow-up as completed
router.get('/date/:date', followUpController.getFollowUpsByDate);

router.put('/:quotationId/status', followUpController.updateFollowup)
module.exports = router;