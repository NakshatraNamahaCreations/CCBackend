const Quotation = require("../models/quotation.model");
const Vendor = require("../models/vendor.model")
const Query = require("../models/query"); 
const mongoose = require("mongoose")

const moment = require("moment");

// Generate next quotationId like "QN0001"
async function generateQuotationId() {
  const latestQuotation = await Quotation.findOne({})
    .sort({ quotationId: -1 })
    .limit(1);

  if (!latestQuotation || !latestQuotation.quotationId) {
    return "QN0001";
  }

  const lastNumber = parseInt(latestQuotation.quotationId.replace("QN", ""));
  const nextNumber = lastNumber + 1;
  return "QN" + nextNumber.toString().padStart(4, "0");
}

// Helper to generate next invoice number
async function generateInvoiceNumber() {
  const latest = await Quotation.findOne({ invoiceNumber: { $exists: true } })
    .sort({ invoiceNumber: -1 })
    .limit(1);

  if (!latest || !latest.invoiceNumber) {
    return "INV0001";
  }
  const lastNum = parseInt(latest.invoiceNumber.replace("INV", "")) || 0;
  const nextNum = lastNum + 1;
  return "INV" + nextNum.toString().padStart(4, "0");
}

// POST /api/quotations/create
exports.createQuotation = async (req, res) => {
  try {
    const {
      leadId,
      queryId,
      quoteTitle,
      quoteDescription,
      packages,
      installments,
      totalAmount,
      discountPercent,
      discountValue,
      gstApplied,
      gstValue,
      marginAmount,
      finalized,
    } = req.body;

    const quotationId = await generateQuotationId();

    // Set default status for installments
    const processedInstallments = (installments || []).map((inst, idx) => ({
      ...inst,
      status: inst.status || 'Pending',
      installmentNumber: inst.installmentNumber || idx + 1,
    }));

    // Set bookingStatus if first installment is completed
    let bookingStatus = 'NotBooked';
    if (processedInstallments.length > 0 && processedInstallments[0].status === 'Completed') {
      bookingStatus = 'Booked';
    }

    const newQuotation = new Quotation({
      leadId,
      queryId,
      quotationId,
      quoteTitle,
      quoteDescription,
      packages,
      installments: processedInstallments,
      totalAmount,
      discountPercent,
      discountValue,
      gstApplied,
      gstValue,
      marginAmount,
      finalized: finalized || false,
      bookingStatus,
    });

    const savedQuotation = await newQuotation.save();
    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotation: savedQuotation,
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message,
    });
  }
};

// GET /api/quotations/by-query/:queryId
exports.getQuotationByQueryId = async (req, res) => {
  try {
    const { queryId } = req.params;
    if (!queryId) {
      return res.status(400).json({ success: false, message: 'queryId is required' });
    }
    // No populate needed, just return the full embedded data
    const quotations = await Quotation.find({ queryId }).lean();
    if (!quotations || quotations.length === 0) {
      return res.status(404).json({ success: false, message: 'No quotations found for this queryId' });
    }
    return res.status(200).json({ success: true, quotations });
  } catch (error) {
    console.error('Error fetching quotations by queryId:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quotations', error: error.message });
  }
};



// GET /api/quotations/finalized
exports.getFinalizedQuotationsPaginated = async (req, res) => {
  try {
    
    const { page, limit , search = "" } = req.query;
    console.log("page", page)
    console.log("limit", limit)
    console.log("search", search)
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    // Build search filter
    const filter = {
      finalized: true,
      ...(search
        ? {
            $or: [
              { quotationId: { $regex: searchRegex } },
              { quoteTitle: { $regex: searchRegex } },
            ],
          }
        : {}),
    };

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      quotations,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching paginated finalized quotations:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch finalized quotations", error: error.message });
  }
};


// GET /api/quotations/:id
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Quotation _id is required' });
    }

    const quotation = await Quotation.findById(id)
      .populate("leadId") // ✅ Populate lead data
       // Optional: populate query if needed

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found for this _id' });
    }

    return res.status(200).json({ success: true, quotation });
  } catch (error) {
    console.error('Error fetching quotation by _id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quotation', error: error.message });
  }
};

// PUT /api/quotations/:id
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Quotation _id is required' });
    }
    const {
      leadId,
      queryId,
      quoteTitle,
      quoteDescription,
      packages,
      installments,
      totalAmount,
      discountPercent,
      discountValue,
      gstApplied,
      gstValue,
      marginAmount,
      finalized,
    } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found for this _id' });
    }

    // Update fields (only if provided)
    if (leadId !== undefined) quotation.leadId = leadId;
    if (queryId !== undefined) quotation.queryId = queryId;
    if (quoteTitle !== undefined) quotation.quoteTitle = quoteTitle;
    if (quoteDescription !== undefined) quotation.quoteDescription = quoteDescription;
    if (packages !== undefined) quotation.packages = packages;
    if (installments !== undefined) quotation.installments = installments;
    if (totalAmount !== undefined) quotation.totalAmount = totalAmount;
    if (discountPercent !== undefined) quotation.discountPercent = discountPercent;
    if (discountValue !== undefined) quotation.discountValue = discountValue;
    if (gstApplied !== undefined) quotation.gstApplied = gstApplied;
    if (gstValue !== undefined) quotation.gstValue = gstValue;
    if (marginAmount !== undefined) quotation.marginAmount = marginAmount;
    if (finalized !== undefined) quotation.finalized = finalized;

    const updatedQuotation = await quotation.save();
    await updatedQuotation.populate('packages');
    await updatedQuotation.populate('installments');

    return res.status(200).json({
      success: true,
      message: 'Quotation updated successfully',
      quotation: updatedQuotation,
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return res.status(500).json({ success: false, message: 'Failed to update quotation', error: error.message });
  }
};


// PATCH /api/quotations/:id/finalize
exports.toggleFinalizedQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalized } = req.body;
    if (typeof finalized !== 'boolean') {
      return res.status(400).json({ success: false, message: 'finalized (boolean) is required in body' });
    }
    // Find the target quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found for this _id' });
    }

    if (finalized) {
      // Unfinalize all others for this queryId (make sure queryId is the correct type)
      await Quotation.updateMany(
        { queryId: quotation.queryId, _id: { $ne: quotation._id } },
        { $set: { finalized: false } }
      );
      // Set this one as finalized
      quotation.finalized = true;
    } else {
      // Just unfinalize this one
      quotation.finalized = false;
    }
    await quotation.save();

    // Double-check: count finalized quotations for this queryId
    const finalizedCount = await Quotation.countDocuments({ queryId: quotation.queryId, finalized: true });

    return res.status(200).json({
      success: true,
      message: `Quotation finalized status set to ${finalized}`,
      quotation,
      finalizedCountForQuery: finalizedCount
    });
  } catch (error) {
    console.error('Error toggling finalized status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update finalized status', error: error.message });
  }
};

// PUT /api/quotations/:quotationId/installment/:installmentId
exports.updateInstallmentStatus = async (req, res) => {
  try {
    const { quotationId, installmentId } = req.params;
    const { dueDate, paymentMode, paymentPercentage, paymentAmount } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // 🔁 UPDATE existing installment
    if (installmentId !== 'new') {
      const installment = quotation.installments.find(inst => String(inst._id) === String(installmentId));
      if (!installment) {
        return res.status(404).json({ success: false, message: 'Installment not found' });
      }

      if (dueDate !== undefined) installment.dueDate = dueDate;
      if (paymentMode !== undefined) installment.paymentMode = paymentMode;
      if (paymentPercentage !== undefined) installment.paymentPercentage = paymentPercentage;
      if (paymentAmount !== undefined) installment.paymentAmount = paymentAmount;

      installment.status = (installment.dueDate && installment.paymentMode) ? 'Completed' : 'Pending';

      // If first installment is completed, mark quotation as booked
      const firstInstallment = quotation.installments[0];
      if (
        firstInstallment &&
        String(firstInstallment._id) === String(installmentId) &&
        installment.status === 'Completed'
      ) {
        quotation.bookingStatus = 'Booked';
        if (quotation.queryId) {
          await Query.findOneAndUpdate(
            { _id: quotation.queryId },
            { status: 'Booked' }
          );
        }
      }
    } 
    // 🆕 CREATE new installment
    else {
      quotation.installments.push({
        dueDate,
        paymentMode,
        paymentPercentage,
        paymentAmount,
        status: (dueDate && paymentMode) ? 'Completed' : 'Pending'
      });
    }

    await quotation.save();
    return res.status(200).json({ success: true, quotation });

  } catch (error) {
    console.error('Error updating/creating installment:', error);
    return res.status(500).json({ success: false, message: 'Failed to update/create installment', error: error.message });
  }
};

exports.deleteInstallment = async (req, res) => {
  try {
    const { quotationId, installmentId } = req.params;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const installmentIndex = quotation.installments.findIndex(
      (inst) => String(inst._id) === String(installmentId)
    );

    if (installmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Installment not found' });
    }

    const isCompleted = quotation.installments[installmentIndex].status === "Completed";
    if (isCompleted) {
      return res.status(400).json({ success: false, message: 'Cannot delete a completed installment' });
    }

    quotation.installments.splice(installmentIndex, 1);

    // Recalculate installment numbers
    quotation.installments.forEach((inst, index) => {
      inst.installmentNumber = index + 1;
    });

    await quotation.save();
    return res.status(200).json({ success: true, quotation });

  } catch (error) {
    console.error("Error deleting installment:", error);
    return res.status(500).json({ success: false, message: "Failed to delete installment", error: error.message });
  }
};

// POST /api/quotations/:id/generate-invoice
exports.generateInvoiceNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    if (quotation.invoiceNumber) {
      return res.status(200).json({ success: true, invoiceNumber: quotation.invoiceNumber });
    }
    const invoiceNumber = await generateInvoiceNumber();
    quotation.invoiceNumber = invoiceNumber;
    await quotation.save();
    return res.status(201).json({ success: true, invoiceNumber });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return res.status(500).json({ success: false, message: "Failed to generate invoice number", error: error.message });
  }
};


// DELETE /api/quotations/:id
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByIdAndDelete(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    return res.status(200).json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return res.status(500).json({ success: false, message: "Failed to delete quotation", error: error.message });
  }
};


// PUT /api/quotations/assign-vendor/:quotationId/package/:packageId/service/:serviceId
exports.assignVendorToService = async (req, res) => {
  const { quotationId, packageId, serviceName } = req.params;
  const { vendorId, vendorName } = req.body;

  try {
    // Step 1: Find the quotation by _id
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // Step 2: Find the correct package
    const selectedPackage = quotation.packages.id(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ success: false, message: 'Package not found in quotation' });
    }

    // Step 3: Find the correct service
    const service = selectedPackage.services.find(s => s.serviceName === serviceName);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found in package' });
    }

    // Step 4: If old vendor is assigned → make them Available first
    if (service.assignedVendor && service.assignedVendor.vendorId) {
      const oldVendorId = service.assignedVendor.vendorId;
      await Vendor.findByIdAndUpdate(oldVendorId, { status: 'Available' });
    }

    // Step 5: Get vendor category from DB
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Step 6: Assign the new vendor
    service.assignedVendor = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
      vendorName,
      category: vendor.category // 'Inhouse Vendor' or 'Outsource Vendor'
    };

    // Step 7: Save the updated quotation
    await quotation.save();

    // Step 8: Set new vendor to Not Available
    await Vendor.findByIdAndUpdate(vendorId, { status: 'Not Available' });

    // Step 9: Return success response
    return res.status(200).json({
      success: true,
      message: `Vendor ${vendorName} successfully assigned to ${serviceName}`,
    });

  } catch (error) {
    console.error("Assign vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// GET /api/quotations/booked-events-by-date/:date
exports.getBookedEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Expected YYYY-MM-DD",
      });
    }

    const quotations = await Quotation.find({
      bookingStatus: "Booked",
      packages: { $elemMatch: { eventStartDate: date } }, // date already in correct format
    })
      .populate({ path: "leadId", select: "persons" })
      .lean();

    const filteredQuotations = quotations
      .map((quotation) => {
        const matchedPackages = quotation.packages.filter(
          (pkg) => pkg.eventStartDate === date
        );
        return matchedPackages.length
          ? { ...quotation, packages: matchedPackages }
          : null;
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: filteredQuotations.length,
      quotations: filteredQuotations,
    });
  } catch (err) {
    console.error("Error fetching booked events by date:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getBookedEventsForToday = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD"); // Ensures correct format

    const quotations = await Quotation.find({
      bookingStatus: "Booked",
      packages: { $elemMatch: { eventStartDate: today } },
    })
      .populate({ path: "leadId", select: "persons" })
      .lean();

    const filteredQuotations = quotations
      .map((quotation) => {
        const matchedPackages = quotation.packages.filter(
          (pkg) => pkg.eventStartDate === today
        );
        return matchedPackages.length
          ? { ...quotation, packages: matchedPackages }
          : null;
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      date: today,
      count: filteredQuotations.length,
      quotations: filteredQuotations,
    });
  } catch (err) {
    console.error("Error fetching today's booked events:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getQuotationsByStatus = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;
    const { status } = req.params;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Only fetch quotations with at least one package whose eventStartDate is today or in the future
    const filter = {
      bookingStatus: status,
      packages: { $elemMatch: { eventStartDate: { $gte: today } } },
      ...(search ? { quotationId: { $regex: searchRegex } } : {}),
    };

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .populate({ path: "leadId", select: "persons" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      quotations,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching quotations by status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
};



exports.addClientInstruction = async (req, res) => {
  const { quotationId } = req.params;
  const { instruction } = req.body;

  if (!instruction || instruction.trim() === "") {
    return res.status(400).json({ success: false, message: "Instruction cannot be empty." });
  }

  try {
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      quotationId,
      { $push: { clientInstructions: instruction } },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "Quotation not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instruction added successfully.",
      clientInstructions: updatedQuotation.clientInstructions,
    });
  } catch (error) {
    console.error("Add Instruction Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.deleteClientInstruction = async (req, res) => {
  const { quotationId } = req.params;
  const { instruction } = req.body;

  try {
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      quotationId,
      { $pull: { clientInstructions: instruction } },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "Quotation not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instruction deleted successfully.",
      clientInstructions: updatedQuotation.clientInstructions,
    });
  } catch (error) {
    console.error("Delete Instruction Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




exports.getCompletedInstallments = async (req, res) => {
  try {
    const completedQuotations = await Quotation.find({
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

    const payments = completedQuotations.map((q) => {
      const firstPerson = q.leadId?.persons[0] || {};
      const completedInstallments = (q.installments || []).filter(
        (inst) => inst.status === "Completed"
      );

      return {
        quotationId: q._id,
        quotationNumber: q.quotationId,
        leadId: q.leadId?._id,
        queryId: q.queryId?._id,
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

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
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

