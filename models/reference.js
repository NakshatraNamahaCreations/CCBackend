const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reference name is required'],
    trim: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Reference || mongoose.model('Reference', referenceSchema);