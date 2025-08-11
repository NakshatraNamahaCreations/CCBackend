// controllers/paymentController.js
const Quotation = require("../models/quotation.model");
const Lead = require("../models/lead");

exports.getCompletedInstallments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) ;
    const limit = parseInt(req.query.limit) ;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    // Step 1: Get all completed quotations
    const quotations = await Quotation.find({
      "installments.status": "Completed",
    })
      .populate({
        path: "leadId",
        select: "persons leadId",
      })
      .populate({
        path: "queryId",
        select: "queryId",
      })
      .lean();

    // Step 2: Map data
    let payments = quotations.map((q) => {
      const firstPerson = q.leadId?.persons[0] || {};
      const completedInstallments = (q.installments || []).filter(
        (inst) => inst.status === "Completed"
      );

      return {
        quotationId: q._id,
        quotationNumber: q.quotationId,
        leadId: q.leadId?.leadId,
        queryId: q.queryId?.queryId,
        firstPersonName: firstPerson.name || "N/A",
        firstPersonPhone: firstPerson.phoneNo || "N/A",
        totalCompletedInstallments: completedInstallments.length,
        completedInstallments: completedInstallments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          amount: inst.paymentAmount,
          dueDate: inst.dueDate,
          mode: inst.paymentMode,
        })),
      };
    });

    // Step 3: Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      payments = payments.filter(
        (p) =>
          p.firstPersonName.toLowerCase().includes(searchLower) ||
          p.firstPersonPhone.includes(search)
      );
    }

    // Step 4: Pagination
    const totalCount = payments.length;
    const paginatedData = payments.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      count: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: paginatedData,
    });
  } catch (error) {
    console.error("Error fetching completed installments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed installments",
      error: error.message,
    });
  }
};
