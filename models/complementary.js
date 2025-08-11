const mongoose = require('mongoose');

const complementarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
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

const Complementary = mongoose.model('Complementary', complementarySchema);
module.exports = Complementary;