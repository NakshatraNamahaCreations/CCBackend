import mongoose from "mongoose";

const otherExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
      trim: true,
    },
    paidTo: {
      type: String,
      required: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OtherExpense", otherExpenseSchema);
