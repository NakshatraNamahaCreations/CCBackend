const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: 0,
  },
  marginPrice: {
    type: Number,
    required: [true, 'Margin price is required'],
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;