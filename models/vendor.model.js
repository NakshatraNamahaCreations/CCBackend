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
  // status: { type: String, enum: ['Available', 'Not Available'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);