const express = require('express');
const router = express.Router();

const {
  createComplementary,
  getComplementaries,
  getComplementary,
  updateComplementary,
  deleteComplementary,
} = require('../Controllers/complementaryController');

router.route('/')
  .post(createComplementary)
  .get(getComplementaries);

router.route('/:id')
  .get(getComplementary)
  .put(updateComplementary)
  .delete(deleteComplementary);

module.exports = router;
