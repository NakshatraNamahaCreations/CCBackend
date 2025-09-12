// C:\Users\admin\Documents\cc\backend\routes\vendor.js
const express = require('express');
const router = express.Router();

const vendorCtrl = require('../Controllers/vendorController');

// Create Vendor
router.post('/', vendorCtrl.createVendor);

// Get All Vendors with pagination and search
router.get('/', vendorCtrl.getAllVendors);

// Get Vendors by Service Name with pagination and search
// router.get('/service-name/:serviceName', vendorCtrl.getVendorsByServiceName);
router.get('/service-name/:serviceName', vendorCtrl.getAvailableVendorsByServiceAndDate);

// Get Vendors by Service ID with pagination and search (legacy)
router.get('/service/:serviceId', vendorCtrl.getVendorsByServiceId);

// Update Vendor
router.put('/:id', vendorCtrl.updateVendor);

// Delete Vendor
router.delete('/:id', vendorCtrl.deleteVendor);
router.get('/inhouse', vendorCtrl.getAvailableInhouseVendors);
router.get('/vendor-payments', vendorCtrl.vendorPayment);

module.exports = router;

