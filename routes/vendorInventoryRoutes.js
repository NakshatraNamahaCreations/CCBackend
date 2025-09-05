const express = require('express');
const router = express.Router();

const vendorInventoryCtrl = require('../Controllers/vendorInventoryController.js');


router.get("/", vendorInventoryCtrl.getAllVendorInventory)


module.exports = router;
