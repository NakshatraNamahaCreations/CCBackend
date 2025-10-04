import OtherExpense from "../models/otherExpense.js";

// ➤ Create a new expense
export const createExpense = async (req, res) => {
  try {
    const { amount, remarks, paidTo, paymentDate } = req.body;

    if (!amount || !remarks || !paidTo || !paymentDate) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const expense = new OtherExpense({
      amount,
      remarks,
      paidTo,
      paymentDate,
    });

    await expense.save();

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    console.error("❌ Create Expense Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ➤ Fetch all expenses (with optional search, date filters, pagination)
// controllers/otherExpenseController.js
export const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", startDate, endDate, all } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { remarks: { $regex: search, $options: "i" } },
        { paidTo: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (all === "true") {
      const expenses = await OtherExpense.find(query).sort({ paymentDate: -1 });
      return res.json({ success: true, data: expenses });
    }

    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      OtherExpense.find(query).sort({ paymentDate: -1 }).skip(skip).limit(Number(limit)),
      OtherExpense.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Get Expenses Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

