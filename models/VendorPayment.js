const mongoose = require('mongoose');

const vendorPaymentSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  slot: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed'],
    default: 'Pending'
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// Update status based on paidAmount and totalAmount
vendorPaymentSchema.pre('save', function(next) {
  if (this.paidAmount === 0) {
    this.status = 'Pending';
  } else if (this.paidAmount < this.totalAmount) {
    this.status = 'Partial';
  } else {
    this.status = 'Completed';
  }
  next();
});

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);