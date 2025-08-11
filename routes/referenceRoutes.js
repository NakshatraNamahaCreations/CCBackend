const express = require('express');
const router = express.Router();
const {
  createReference,
  getReferences,
  getReference,
  updateReference,
  deleteReference,
} = require('../Controllers/referenceController');

// Create
router.post('/', createReference);
// Read all
router.get('/', getReferences);
// Read one
router.get('/:id', getReference);
// Update
router.put('/:id', updateReference);
// Delete
router.delete('/:id', deleteReference);

module.exports = router;