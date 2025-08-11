// // C:\Users\admin\Documents\cc\backend\models\vendor.model.js
// const mongoose = require('mongoose');

// const vendorSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Vendor name is required'],
//     trim: true,
//   },
//   category: {
//     type: String,
//     required: [true, 'Vendor category is required'],
//     enum: {
//       values: ['Inhouse Vendor', 'Outsource Vendor'],
//       message: 'Category must be either "Inhouse Vendor" or "Outsource Vendor"',
//     },
//   },
//   contactPerson: {
//     type: String,
//     required: [true, 'Contact person name is required'],
//     trim: true,
//   },
//   phoneNo: {
//     type: String,
//     required: [true, 'Phone number is required'],
//     trim: true,
//     match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     trim: true,
//     lowercase: true,
//     match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
//   },
//   address: {
//     type: String,
//     required: [true, 'Address is required'],
//     trim: true,
//   },
//   services: [
//     {
//       id: {
//         type: String,
//         required: [true, 'Service ID is required'],
//       },
//       serviceName: {
//         type: String,
//         required: [true, 'Service name is required'],
//         trim: true,
//       },
//       price: {
//         type: Number,
//         required: [true, 'Service price is required'],
//         min: [0, 'Price cannot be negative'],
//       },
//     },
//   ],
//   designation: {
//     type: String,
//     trim: true,
//     default: '',
//   },
//   expertiseLevel: {
//     type: String,
//     enum: {
//       values: ['Beginner', 'Intermediate', 'Advanced', ''],
//       message: 'Expertise level must be either "Beginner", "Intermediate", or "Advanced"',
//     },
//     default: '',
//   },
//   camera: {
//     type: String,
//     trim: true,
//     default: '', // Optional, only for Outsource Vendors
//   },
//   otherEquipment: {
//     type: String,
//     trim: true,
//     default: '', // Optional, only for Outsource Vendors
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Ensure unique custom ID
// vendorSchema.index({ id: 1 }, { unique: true });

// // Update timestamp on save
// vendorSchema.pre('save', function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Vendor', vendorSchema);

const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountHolder: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  branch: { type: String, required: true },
  panNumber: { type: String },
  aadhaarNumber: { type: String, required: true }
});

const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number },
  marginPrice: { type: Number }
}, { _id: false });

const EquipmentDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  models: [{ type: String, required: true }],
  sameModel: { type: Boolean, default: false }
});

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Inhouse Vendor', 'Outsource Vendor'], required: true },
  contactPerson: { type: String, required: true },
  phoneNo: { type: String, required: true },
  alternatePhoneNo: { type: String },
  email: { type: String, required: true },
  address: { type: String, required: true },
  services: [ServiceSchema],
  equipmentDetails: [EquipmentDetailsSchema],
  bankDetails: BankDetailsSchema,
  experience: { type: String },
  designation: { type: String },
  expertiseLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  camera: { type: String },
  otherEquipment: { type: String },
  status: { type: String, enum: ['Available', 'Not Available'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);