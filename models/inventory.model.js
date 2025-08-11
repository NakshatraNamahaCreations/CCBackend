const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => require('uuid').v4(),
  },
  equipmentName: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
  },
  sensor: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // File path (e.g., 'uploads/inventory/123.jpg')
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  quantity: {
    type: Number,
    min: [0, 'Quantity cannot be negative'],
  },
  processor: {
    type: String,
    trim: true,
  },
  videoQuality: {
    type: String,
    trim: true,
  },
  isoRange: {
    type: String,
    trim: true,
  },
  autofocus: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

inventorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);