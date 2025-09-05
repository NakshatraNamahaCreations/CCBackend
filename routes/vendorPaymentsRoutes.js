const express = require('express');
const router = express.Router();
const {
  createVendorPayment,
  getVendorPayments,
  addPayment,
  getVendorPaymentById
} = require('../Controllers/vendorPaymentController');

// Create new vendor payment
router.post('/', createVendorPayment);

// Get all vendor payments with pagination and search
router.get('/', getVendorPayments);

// Get vendor payment by ID
router.get('/:id', getVendorPaymentById);

// Add payment to existing vendor payment
router.post('/:id/payments', addPayment);

module.exports = router;