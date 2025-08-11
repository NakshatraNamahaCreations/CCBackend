const mongoose = require("mongoose");
const { Schema } = mongoose;

const InstallmentSchema = new Schema(
  {
    installmentPercentage: {
      type: Number,
      required: true, // Percentage of the total amount for this installment
    },
    installmentAmount: {
      type: Number,
      required: true, // Amount for this installment
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"], // Status of the installment
      default: "Pending",
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation", // Reference to the Quotation model
      required: true,
    },
  },
  { timestamps: true }
);

// Model for Installment
const Installment = mongoose.model("Installment", InstallmentSchema);
module.exports = Installment;
