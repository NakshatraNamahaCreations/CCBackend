const mongoose = require('mongoose');

const presetQuotationSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  services: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
      serviceName: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      marginPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      qty: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalMarginAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PresetQuotation = mongoose.model('PresetQuotation', presetQuotationSchema);
module.exports = PresetQuotation;