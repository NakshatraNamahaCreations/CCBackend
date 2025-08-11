const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phoneNo: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  whatsappNo: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'WhatsApp number must be 10 digits'],
    default: '',
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    unique: true,
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'At least one category is required'],
  }],
  eventStartDate: {
    type: Date,
    required: [true, 'Event start date is required'],
  },
eventEndDate: {
  type: Date,
  required: [true, 'Event end date is required'],
  validate: {
    validator: function(value) {
      if (!this.eventStartDate || !value) return true; // skip validation if missing

      const start = new Date(
        this.eventStartDate.getFullYear(),
        this.eventStartDate.getMonth(),
        this.eventStartDate.getDate()
      );
      const end = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );

      return end >= start;
    },
    message: 'Event end date must be on or after the event start date',
  },
},

  referenceForm: {
    type: String,
    trim: true,
    default: '',
  },
  createdDate: {
    type: Date,
    required: [true, 'Created date is required'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [null, 'Call Later', 'Quotation', 'Not Interested'],
    default: null,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [null, 'Call Later', 'Quotation', 'Not Interested'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
});

customerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);