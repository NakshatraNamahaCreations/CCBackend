const express = require('express');
const router = express.Router();

const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getAllServices
} = require('../Controllers/serviceController');

router.route('/')
  .post(createService)
  .get(getServices);

router.route("/all").get(getAllServices)

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

module.exports = router;
