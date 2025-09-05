const VendorPayment = require('../models/VendorPayment');

// Create new vendor payment
const createVendorPayment = async (req, res) => {
  try {
    const { vendorId, vendorName, eventDate, slot, totalAmount, paidAmount, paidDate } = req.body;

    // Create payment history entry if paidAmount > 0
    const paymentHistory = [];
    if (paidAmount > 0) {
      paymentHistory.push({
        amount: paidAmount,
        paymentDate: paidDate || new Date(),
        note: 'Initial payment'
      });
    }

    const vendorPayment = new VendorPayment({
      vendorId,
      vendorName,
      eventDate,
      slot,
      totalAmount,
      paidAmount: paidAmount || 0,
      paidDate: paidAmount > 0 ? (paidDate || new Date()) : null,
      paymentHistory
    });

    await vendorPayment.save();
    res.status(201).json({
      success: true,
      message: 'Vendor payment created successfully',
      data: vendorPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create vendor payment',
      error: error.message
    });
  }
};

// Get all vendor payments with pagination and search
const getVendorPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { slot: { $regex: search, $options: 'i' } }
      ];
    }

    const vendorPayments = await VendorPayment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VendorPayment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: vendorPayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor payments',
      error: error.message
    });
  }
};

// Add payment to existing vendor payment
const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, note } = req.body;

    const vendorPayment = await VendorPayment.findById(id);
    if (!vendorPayment) {
      return res.status(404).json({
        success: false,
        message: 'Vendor payment not found'
      });
    }

    // Check if adding this payment would exceed total amount
    const newPaidAmount = vendorPayment.paidAmount + amount;
    if (newPaidAmount > vendorPayment.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds total amount due'
      });
    }

    // Add to payment history
    vendorPayment.paymentHistory.push({
      amount,
      paymentDate: paymentDate || new Date(),
      note: note || 'Additional payment'
    });

    // Update paid amount and status
    vendorPayment.paidAmount = newPaidAmount;
    vendorPayment.paidDate = paymentDate || new Date();

    await vendorPayment.save();

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: vendorPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add payment',
      error: error.message
    });
  }
};

// Get vendor payment by ID
const getVendorPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorPayment = await VendorPayment.findById(id);
    
    if (!vendorPayment) {
      return res.status(404).json({
        success: false,
        message: 'Vendor payment not found'
      });
    }

    res.json({
      success: true,
      data: vendorPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor payment',
      error: error.message
    });
  }
};

module.exports = {
  createVendorPayment,
  getVendorPayments,
  addPayment,
  getVendorPaymentById
};