const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../Controllers/customerController');

// Routes for customers
router.post('/', createCustomer); // Create a customer
router.get('/', getCustomers); // Get all customers
router.get('/:id', getCustomerById); // Get a single customer by ID
router.put('/:id', updateCustomer); // Update a customer
router.delete('/:id', deleteCustomer); // Delete a customer

module.exports = router;