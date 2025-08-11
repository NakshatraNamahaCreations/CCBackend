const mongoose = require('mongoose');

  const maintenanceSchema = new mongoose.Schema({
    inventoryId: {
      type: String,
      required: [true, 'Inventory ID is required'],
      trim: true,
    },
    equipmentName: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    issue: {
      type: String,
      required: [true, 'Issue is required'],
      trim: true,
    },
    damagedBy: {
      type: String,
      required: [true, 'Damaged by is required'],
      trim: true,
    },
    sendDate: {
      type: Date,
      required: [true, 'Send date is required'],
    },
    status: {
      type: String,
      enum: ['Not Yet Sent', 'In Process', 'Resolved'],
      default: 'Not Yet Sent',
    },
    remarks: {
      type: String,
      trim: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
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

  maintenanceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });

  module.exports = mongoose.model('Maintenance', maintenanceSchema);