const Customer = require('../models/customer');
const Category = require('../models/category');

// Helper: parse date string "YYYY-MM-DD" without timezone shift
const parseDateWithoutTimezoneShift = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-'); // expect ["YYYY", "MM", "DD"]
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      whatsappNo,
      email,
      category,
      eventStartDate,
      eventEndDate,
      referenceForm,
      createdDate,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !phoneNo ||
      !email ||
      !category ||
      !Array.isArray(category) ||
      category.length === 0 ||
      !eventStartDate ||
      !eventEndDate ||
      !createdDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, phone number, email, at least one category, event start date, event end date, and created date are required',
      });
    }

    // Validate date strings
    if (isNaN(Date.parse(eventStartDate))) {
      return res.status(400).json({ success: false, message: 'Invalid eventStartDate' });
    }
    if (isNaN(Date.parse(eventEndDate))) {
      return res.status(400).json({ success: false, message: 'Invalid eventEndDate' });
    }
    if (isNaN(Date.parse(createdDate))) {
      return res.status(400).json({ success: false, message: 'Invalid createdDate' });
    }

    // Parse dates safely
    const startDate = parseDateWithoutTimezoneShift(eventStartDate);
    const endDate = parseDateWithoutTimezoneShift(eventEndDate);
    const creationDate = new Date(createdDate);

    // Check date logic
    if (!startDate || !endDate || !creationDate) {
      return res.status(400).json({ success: false, message: 'Invalid dates provided' });
    }
    if (endDate.getTime() < startDate.getTime()) {
      return res
        .status(400)
        .json({ success: false, message: 'Event end date must be on or after event start date' });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Validate all category IDs
    for (const catId of category) {
      const categoryExists = await Category.findById(catId);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: `Invalid category ID: ${catId}` });
      }
    }

    const customer = new Customer({
      name,
      phoneNo,
      whatsappNo: whatsappNo || '',
      email,
      category,
      eventStartDate: startDate,
      eventEndDate: endDate,
      referenceForm: referenceForm || '',
      createdDate: creationDate,
      status: status || null,
    });

    await customer.save();

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate('category', 'name');
    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('category', 'name');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a customer
const updateCustomer = async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      whatsappNo,
      email,
      category,
      eventStartDate,
      eventEndDate,
      referenceForm,
      createdDate,
      status,
    } = req.body;

    // Basic required fields validation
    if (
      !name ||
      !phoneNo ||
      !email ||
      !category ||
      !Array.isArray(category) ||
      category.length === 0 ||
      !eventStartDate ||
      !eventEndDate ||
      !createdDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, phone number, email, at least one category, event start date, event end date, and created date are required',
      });
    }

    // Validate email uniqueness
    const existingCustomer = await Customer.findOne({ email, _id: { $ne: req.params.id } });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Validate category IDs exist
    for (const catId of category) {
      const categoryExists = await Category.findById(catId);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: `Invalid category ID: ${catId}` });
      }
    }

    // Validate date strings
    if (isNaN(Date.parse(eventStartDate))) {
      return res.status(400).json({ success: false, message: 'Invalid eventStartDate' });
    }
    if (isNaN(Date.parse(eventEndDate))) {
      return res.status(400).json({ success: false, message: 'Invalid eventEndDate' });
    }
    if (isNaN(Date.parse(createdDate))) {
      return res.status(400).json({ success: false, message: 'Invalid createdDate' });
    }

    // Parse dates safely
    const startDate = new Date(eventStartDate);
    const endDate = new Date(eventEndDate);
    const creationDate = new Date(createdDate);

    if (
      !eventStartDate ||
      isNaN(startDate) ||
      !eventEndDate ||
      isNaN(endDate) ||
      !createdDate ||
      isNaN(creationDate)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid dates provided' });
    }

    // Helper function to compare only date parts (ignore time/timezone)
    const isEndDateBeforeStartDate = (start, end) => {
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return e < s;
    };

    if (isEndDateBeforeStartDate(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Event end date must be on or after event start date',
      });
    }

    // Fetch current customer document
    const currentCustomer = await Customer.findById(req.params.id);
    if (!currentCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Ensure statusHistory is an array before spreading
    const statusHistory = Array.isArray(currentCustomer.statusHistory)
      ? [...currentCustomer.statusHistory]
      : [];

    // Append to statusHistory if status changed
    const newStatus = status || null;
    if (currentCustomer.status !== newStatus) {
      statusHistory.push({ status: newStatus, timestamp: new Date() });
    }

    // Update the customer document
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phoneNo,
        whatsappNo: whatsappNo || '',
        email,
        category,
        eventStartDate: startDate,
        eventEndDate: endDate,
        referenceForm: referenceForm || '',
        createdDate: creationDate,
        status: newStatus,
        statusHistory,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
