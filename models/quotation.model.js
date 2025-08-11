const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },
    quotationId: {
      type: String,
      required: true,
      unique: true,
    },
    quoteTitle: String,
    quoteDescription: String,
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    packages: [
      {
        categoryName: String,
        packageType: {
          type: String,
          enum: ["Custom", "Preset"],
          default: "Custom",
        },
        eventStartDate: String,
        eventEndDate: String,
        slot: String,
        venueName: String,
        venueAddress: String,
        services: [
          {
            serviceName: String,
            price: Number,
            marginPrice: Number,
            qty: Number,
            assignedVendor: {
              vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
              vendorName: String,
              category: String,
            },
          },
        ],
      },
    ],

    installments: [
      {
        installmentNumber: Number,
        dueDate: String,
        paymentMode: String,
        paymentAmount: Number,
        paymentPercentage: Number,
        status: {
          type: String,
          enum: ["Pending", "Completed"],
          default: "Pending",
        },
      },
    ],

    totalAmount: Number,
    discountPercent: Number,
    discountValue: Number,
    gstApplied: Boolean,
    gstValue: Number,
    marginAmount: Number,

    bookingStatus: {
      type: String,
      enum: ["NotBooked", "Booked"],
      default: "NotBooked",
    },

    finalized: {
      type: Boolean,
      default: false,
    },

    clientInstructions: {
      type: [String], // ✅ array of strings
      default: [],
    },


  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", QuotationSchema);
