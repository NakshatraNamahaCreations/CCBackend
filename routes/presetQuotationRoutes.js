const express = require('express');
const router = express.Router();
const {
  createPresetQuotation,
  getPresetQuotations,
  getPresetQuotation,
  updatePresetQuotation,
  deletePresetQuotation,
} = require('../Controllers/presetQuotationController');

// Routes for preset quotations
router.route('/')
  .post(createPresetQuotation)
  .get(getPresetQuotations);

router.route('/:id')
  .get(getPresetQuotation)
  .put(updatePresetQuotation)
  .delete(deletePresetQuotation);

module.exports = router;