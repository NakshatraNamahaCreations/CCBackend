const Quotation = require("../models/quotation.model");
const Vendor = require("../models/vendor.model");
const Query = require("../models/query");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const moment = require("moment");
const VendorInventory = require("../models/vendorInventory");
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

exports.createQuotation = async (req, res) => {
  try {
    console.log("Request body:", JSON.stringify(req.body, null, 2)); // Debug log

    const {
      leadId,
      queryId,
      quoteTitle = "",
      quoteDescription = "",
      quoteNote = "",
      packages = [],
      installments = [],
      totalAmount = 0,
      // discountPercent = 0,
      discountValue = 0,
      gstApplied = false,
      gstValue = 0,
      marginAmount = 0,
      totalPackageAmt = 0,
      totalAlbumAmount = 0,
      finalized = false,
      albums = [],
    } = req.body;

    // Validate required fields
    if (!leadId || !queryId) {
      return res.status(400).json({
        success: false,
        message: "leadId and queryId are required",
      });
    }

    let quotationId;
    try {
      quotationId = await generateQuotationId();
    } catch (err) {
      console.error("Failed to generate quotation ID:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to generate quotation ID",
      });
    }

    // Process installments with defaults
    const processedInstallments = installments.map((inst, idx) => ({
      ...inst,
      status: inst.status || "Pending",
      installmentNumber: inst.installmentNumber || idx + 1,
      amountPaid: inst.amountPaid || 0,
    }));

    const bookingStatus = processedInstallments.some(
      (i) => i.status === "Completed"
    )
      ? "Booked"
      : "NotBooked";

    const newQuotation = new Quotation({
      leadId,
      queryId,
      quotationId,
      quoteTitle,
      quoteDescription,
      quoteNote,
      packages,
      installments: processedInstallments,
      totalAmount,
      // discountPercent,
      discountValue,
      gstApplied,
      gstValue,
      marginAmount,
      finalized,
      bookingStatus,
      totalPackageAmt,
      totalAlbumAmount,
      albums,
      // albums will default to [] automatically
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
      stack: error.stack, // Include stack trace for debugging
    });
  }
};

// PUT /api/quotations/:id
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Quotation _id is required" });
    }
    const {
      leadId,
      queryId,
      quoteTitle,
      quoteDescription,
      quoteNote,
      packages,
      installments,
      totalAmount,
      // discountPercent,
      discountValue,
      gstApplied,
      gstValue,
      marginAmount,
      finalized,
      totalPackageAmt,
      totalAlbumAmount,
      albums,
    } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found for this _id" });
    }

    // Update fields (only if provided)
    if (leadId !== undefined) quotation.leadId = leadId;
    if (queryId !== undefined) quotation.queryId = queryId;
    if (quoteTitle !== undefined) quotation.quoteTitle = quoteTitle;
    if (quoteDescription !== undefined)
      quotation.quoteDescription = quoteDescription;
    if (quoteNote !== undefined) quotation.quoteNote = quoteNote;
    if (packages !== undefined) quotation.packages = packages;
    if (installments !== undefined) quotation.installments = installments;
    if (totalAmount !== undefined) quotation.totalAmount = totalAmount;
    // if (discountPercent !== undefined)
    //   quotation.discountPercent = discountPercent;
    if (discountValue !== undefined) quotation.discountValue = discountValue;
    if (gstApplied !== undefined) quotation.gstApplied = gstApplied;
    if (gstValue !== undefined) quotation.gstValue = gstValue;
    if (marginAmount !== undefined) quotation.marginAmount = marginAmount;
    if (finalized !== undefined) quotation.finalized = finalized;
    if (totalPackageAmt !== undefined)
      quotation.totalPackageAmt = totalPackageAmt;
    if (totalAlbumAmount !== undefined)
      quotation.totalAlbumAmount = totalAlbumAmount;
    if (albums !== undefined) {
      quotation.albums = albums; // replace whole array
      quotation.markModified("albums"); // ensure nested Map fields persist
    }

    const updatedQuotation = await quotation.save();
    await updatedQuotation.populate("packages");
    await updatedQuotation.populate("installments");

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      quotation: updatedQuotation,
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

// GET /api/quotations/by-query/:queryId
exports.getQuotationByQueryId = async (req, res) => {
  try {
    const { queryId } = req.params;
    if (!queryId) {
      return res
        .status(400)
        .json({ success: false, message: "queryId is required" });
    }
    // No populate needed, just return the full embedded data
    const quotations = await Quotation.find({ queryId }).lean();
    if (!quotations || quotations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quotations found for this queryId",
      });
    }
    return res.status(200).json({ success: true, quotations });
  } catch (error) {
    console.error("Error fetching quotations by queryId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
};

// GET /api/quotations/finalized
exports.getFinalizedQuotationsPaginated = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;
    console.log("page", page);
    console.log("limit", limit);
    console.log("search", search);
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch finalized quotations",
      error: error.message,
    });
  }
};

// GET /api/quotations/:id
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Quotation _id is required" });
    }

    const quotation = await Quotation.findById(id).populate("leadId"); // ✅ Populate lead data
    // Optional: populate query if needed

    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found for this _id" });
    }

    return res.status(200).json({ success: true, quotation });
  } catch (error) {
    console.error("Error fetching quotation by _id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
};

// PATCH /api/quotations/:id/finalize
exports.toggleFinalizedQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalized } = req.body;
    if (typeof finalized !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "finalized (boolean) is required in body",
      });
    }
    // Find the target quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found for this _id" });
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
    const finalizedCount = await Quotation.countDocuments({
      queryId: quotation.queryId,
      finalized: true,
    });

    return res.status(200).json({
      success: true,
      message: `Quotation finalized status set to ${finalized}`,
      quotation,
      finalizedCountForQuery: finalizedCount,
    });
  } catch (error) {
    console.error("Error toggling finalized status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update finalized status",
      error: error.message,
    });
  }
};

// PUT /api/quotations/:quotationId/installment/:installmentId
// exports.updateInstallmentStatus = async (req, res) => {
//   try {
//     const { quotationId, installmentId } = req.params;
//     const { dueDate, paymentMode, paymentPercentage, paymentAmount, status } =
//       req.body;

//     const quotation = await Quotation.findById(quotationId);
//     if (!quotation) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }

//     if (installmentId !== "new") {
//       const installment = quotation.installments.find(
//         (inst) => String(inst._id) === String(installmentId)
//       );
//       if (!installment) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Installment not found" });
//       }

//       // Update fields from request
//       if (dueDate !== undefined) installment.dueDate = dueDate;
//       if (paymentMode !== undefined) installment.paymentMode = paymentMode;
//       if (paymentPercentage !== undefined)
//         installment.paymentPercentage = paymentPercentage;
//       if (status !== undefined) installment.status = status;

//       if (paymentAmount !== undefined) {
//         installment.paymentAmount = paymentAmount;
//         // Update paid/pending amounts based on the status from frontend
//         if (status === "Completed") {
//           installment.paidAmount = paymentAmount;
//           installment.pendingAmount = 0;
//         } else if (status === "Partial Paid") {
//           // For partial payments, maintain existing paidAmount or set to paymentAmount
//           installment.paidAmount = installment.paidAmount || paymentAmount;
//           installment.pendingAmount = paymentAmount - installment.paidAmount;
//         } else {
//           // Pending status
//           installment.paidAmount = 0;
//           installment.pendingAmount = paymentAmount;
//         }
//       }

//       // business rule for first installment
//       const firstInstallment = quotation.installments[0];
//       if (
//         firstInstallment &&
//         String(firstInstallment._id) === String(installmentId) &&
//         installment.status === "Completed"
//       ) {
//         quotation.bookingStatus = "Booked";
//         if (quotation.queryId) {
//           await Query.findOneAndUpdate(
//             { _id: quotation.queryId },
//             { status: "Booked" }
//           );
//         }
//       }
//     } else {
//       // For new installment, use status from frontend or default to Pending
//       const newStatus = status || "Pending";
//       const planned = paymentAmount ?? 0;

//       quotation.installments.push({
//         dueDate,
//         paymentMode,
//         paymentPercentage,
//         paymentAmount: planned,
//         paidAmount: newStatus === "Completed" ? planned : 0,
//         pendingAmount: newStatus === "Completed" ? 0 : planned,
//         status: newStatus,
//       });
//     }

//     await quotation.save();
//     return res.status(200).json({ success: true, quotation });
//   } catch (error) {
//     console.error("Error updating/creating installment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update/create installment",
//       error: error.message,
//     });
//   }
// };

// exports.updateInstallmentFirstPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { quotationId, installmentId } = req.params;
//     const { dueDate, paymentMode, paymentAmount, status } = req.body;

//     const allowed = ["Pending", "Partial Paid", "Completed"];
//     if (status && !allowed.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Allowed: ${allowed.join(", ")}`,
//       });
//     }

//     const filter = mongoose.isValidObjectId(quotationId)
//       ? { _id: quotationId }
//       : { quotationId };

//     // Load quotation in the session
//     const doc = await Quotation.findOne(filter).session(session);
//     if (!doc) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });
//     }

//     const inst = doc.installments.id(installmentId);
//     if (!inst) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Installment not found" });
//     }

//     // --- Update the targeted installment ---
//     if (dueDate !== undefined) inst.dueDate = dueDate;
//     if (paymentMode !== undefined) inst.paymentMode = paymentMode;
//     if (status !== undefined) inst.status = status;

//     const paidNow = Number(paymentAmount ?? inst.paymentAmount ?? 0);
//     inst.paidAmount = paidNow;
//     inst.pendingAmount = 0; // this one is paid

//     // --- Other installments: pending = their planned amount (leave paid/status as-is) ---
//     doc.installments.forEach((i) => {
//       if (i._id.toString() !== installmentId) {
//         i.pendingAmount = Number(i.paymentAmount ?? 0);
//       }
//     });

//     // --- NEW: mark booking as Booked (unless already Completed) ---
//     if (doc.bookingStatus !== "Completed") {
//       doc.bookingStatus = "Booked";
//     }

//     await doc.save({ session });

//     // --- NEW: also mark the related Query's status as Booked ---
//     if (doc.queryId) {
//       await Query.findByIdAndUpdate(
//         doc.queryId,
//         { $set: { status: "Booked" } },
//         { session }
//       );
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.json({
//       success: true,
//       message:
//         "First payment recorded; booking & query marked as Booked; other installments pending set to their paymentAmount.",
//       data: {
//         quotationId: doc._id,
//         updatedInstallment: doc.installments.id(installmentId),
//         installments: doc.installments,
//         bookingStatus: doc.bookingStatus,
//       },
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("updateInstallmentFirstPayment error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to record first payment",
//       error: err.message,
//     });
//   }
// };

exports.deleteInstallment = async (req, res) => {
  try {
    const { quotationId, installmentId } = req.params;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    const installmentIndex = quotation.installments.findIndex(
      (inst) => String(inst._id) === String(installmentId)
    );

    if (installmentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Installment not found" });
    }

    const isCompleted =
      quotation.installments[installmentIndex].status === "Completed";
    if (isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a completed installment",
      });
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
    return res.status(500).json({
      success: false,
      message: "Failed to delete installment",
      error: error.message,
    });
  }
};

// POST /api/quotations/:id/generate-invoice
exports.generateInvoiceNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    if (quotation.invoiceNumber) {
      return res
        .status(200)
        .json({ success: true, invoiceNumber: quotation.invoiceNumber });
    }
    const invoiceNumber = await generateInvoiceNumber();
    quotation.invoiceNumber = invoiceNumber;
    await quotation.save();
    return res.status(201).json({ success: true, invoiceNumber });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice number",
      error: error.message,
    });
  }
};

// DELETE /api/quotations/:id
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByIdAndDelete(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
};


// ---------------- Helper Functions ----------------

// Ensures assignedVendors/Assistants array has enough slots
// function ensureCapacity(arr, len) {
//   if (!Array.isArray(arr)) arr = [];
//   while (arr.length < len) arr.push(null);
//   return arr;
// }

// // Checks if two date ranges overlap
function hasOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

// // ---------------- Vendor Assignment ----------------

// /**
//  * PUT /api/quotations/:quotationId/package/:packageId/service/:serviceId/unit/:unitIndex/assign-vendor
//  * Body: { vendorId, vendorName, slot, eventStartDate, eventEndDate }
//  */
// exports.assignVendorToServiceUnit = async (req, res) => {
//   const { quotationId, packageId, serviceId, unitIndex } = req.params;
//   const { vendorId, vendorName, slot, eventStartDate, eventEndDate } = req.body;

//   try {
//     const quotation = await Quotation.findById(quotationId);
//     if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

//     const pkg = quotation.packages.id(packageId);
//     if (!pkg) return res.status(404).json({ success: false, message: "Package not found in quotation" });

//     const service = pkg.services.id(serviceId);
//     if (!service) return res.status(404).json({ success: false, message: "Service not found in package" });

//     const unit = parseInt(unitIndex, 10);
//     const qty = Math.max(1, service.qty || 1);
//     if (Number.isNaN(unit) || unit < 0 || unit >= qty) {
//       return res.status(400).json({ success: false, message: "Invalid unitIndex" });
//     }

//     // Ensure array capacity
//     service.assignedVendors = ensureCapacity(service.assignedVendors, qty);

//     // 🟢 Remove previous booking from inventory
//     const previousAssignment = service.assignedVendors[unit];
//     if (previousAssignment?.vendorId) {
//       await VendorInventory.findOneAndDelete({
//         vendorId: previousAssignment.vendorId,
//         eventStartDate: previousAssignment.eventStartDate,
//         eventEndDate: previousAssignment.eventEndDate,
//         slot: previousAssignment.slot,
//       }).catch(console.error);
//     }

//     if (vendorId) {
//       const vendor = await Vendor.findById(vendorId);
//       if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

//       const finalVendorName = vendorName || vendor.name;

//       // 🛑 Prevent overlapping booking
//       const existingBookings = await VendorInventory.find({ vendorId });
//       const overlap = existingBookings.some((b) => {
//         if (!hasOverlap(eventStartDate, eventEndDate, b.eventStartDate, b.eventEndDate)) return false;
//         // block if same slot or if either is full day
//         return slot === "Full Day" || b.slot === "Full Day" || b.slot === slot;
//       });

//       if (overlap) {
//         return res.status(400).json({
//           success: false,
//           message: `Vendor ${finalVendorName} already booked between ${eventStartDate} and ${eventEndDate} (${slot})`,
//         });
//       }

//       // ✅ Assign new vendor
//       service.assignedVendors[unit] = {
//         vendorId: new mongoose.Types.ObjectId(vendorId),
//         vendorName: finalVendorName,
//         category: vendor.category,
//         assignedDate: new Date(),
//         slot,
//         eventStartDate,
//         eventEndDate,
//         salary: vendor.specialization.find((s) => s.name === service.serviceName)?.salary || 0,
//         paymentStatus: "Pending",
//       };

//       // Save to VendorInventory
//       const vendorInventoryEntry = new VendorInventory({
//         vendorId,
//         vendorName: finalVendorName,
//         eventStartDate,
//         eventEndDate,
//         slot,
//       });
//       await vendorInventoryEntry.save();
//     } else {
//       // ❌ Clear assignment
//       service.assignedVendors[unit] = null;
//     }

//     await quotation.save();
//     return res.status(200).json({
//       success: true,
//       message: vendorId
//         ? `Vendor ${vendorName} assigned to ${service.serviceName} (unit ${unit + 1}/${qty})`
//         : `Vendor cleared for ${service.serviceName} (unit ${unit + 1}/${qty})`,
//       service: service.toObject(),
//     });
//   } catch (err) {
//     console.error("assignVendorToServiceUnit error:", err);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // ---------------- Assistant Assignment ----------------

// /**
//  * PUT /api/quotations/:quotationId/package/:packageId/service/:serviceId/unit/:unitIndex/assign-assistant
//  * Body: { assistantId, assistantName, slot, eventStartDate, eventEndDate }
//  */
// exports.assignAssistantToServiceUnit = async (req, res) => {
//   const { quotationId, packageId, serviceId, unitIndex } = req.params;
//   const { assistantId, assistantName, slot, eventStartDate, eventEndDate } = req.body;

//   try {
//     const quotation = await Quotation.findById(quotationId);
//     if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

//     const pkg = quotation.packages.id(packageId);
//     if (!pkg) return res.status(404).json({ success: false, message: "Package not found in quotation" });

//     const service = pkg.services.id(serviceId);
//     if (!service) return res.status(404).json({ success: false, message: "Service not found in package" });

//     const unit = parseInt(unitIndex, 10);
//     const qty = Math.max(1, service.qty || 1);
//     if (Number.isNaN(unit) || unit < 0 || unit >= qty) {
//       return res.status(400).json({ success: false, message: "Invalid unitIndex" });
//     }

//     // Ensure array capacity
//     service.assignedAssistants = ensureCapacity(service.assignedAssistants, qty);

//     // 🟢 Remove previous booking
//     const previousAssignment = service.assignedAssistants[unit];
//     if (previousAssignment?.assistantId) {
//       await VendorInventory.findOneAndDelete({
//         vendorId: previousAssignment.assistantId,
//         eventStartDate: previousAssignment.eventStartDate,
//         eventEndDate: previousAssignment.eventEndDate,
//         slot: previousAssignment.slot,
//       }).catch(console.error);
//     }

//     if (assistantId) {
//       const asst = await Vendor.findById(assistantId);
//       if (!asst) return res.status(404).json({ success: false, message: "Assistant vendor not found" });

//       // 🛑 Prevent overlapping booking
//       const existingBookings = await VendorInventory.find({ vendorId: assistantId });
//       const overlap = existingBookings.some((b) => {
//         if (!hasOverlap(eventStartDate, eventEndDate, b.eventStartDate, b.eventEndDate)) return false;
//         return slot === "Full Day" || b.slot === "Full Day" || b.slot === slot;
//       });

//       if (overlap) {
//         return res.status(400).json({
//           success: false,
//           message: `Assistant ${assistantName || asst.name} already booked between ${eventStartDate} and ${eventEndDate} (${slot})`,
//         });
//       }

//       // ✅ Assign new assistant
//       service.assignedAssistants[unit] = {
//         assistantId: new mongoose.Types.ObjectId(assistantId),
//         assistantName: assistantName || asst.name,
//         category: asst.category,
//         slot,
//         eventStartDate,
//         eventEndDate,
//       };

//       // Save to VendorInventory
//       const entry = new VendorInventory({
//         vendorId: assistantId,
//         vendorName: assistantName || asst.name,
//         eventStartDate,
//         eventEndDate,
//         slot,
//       });
//       await entry.save();
//     } else {
//       service.assignedAssistants[unit] = null;
//     }

//     await quotation.save();
//     return res.status(200).json({
//       success: true,
//       message: assistantId
//         ? `Assistant ${assistantName} assigned to ${service.serviceName} (unit ${unit + 1}/${qty})`
//         : `Assistant cleared for ${service.serviceName} (unit ${unit + 1}/${qty})`,
//       service: service.toObject(),
//     });
//   } catch (err) {
//     console.error("assignAssistantToServiceUnit error:", err);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// Ensures assignedVendors/Assistants array has enough slots

 // Checks if two date ranges overlap
function hasOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}


function ensureCapacity(arr, len) {
  if (!Array.isArray(arr)) arr = [];
  while (arr.length < len) arr.push(null);
  return arr;
}

// Utility
function normalizeDate(date) {
  return dayjs(date).format("YYYY-MM-DD");
}

exports.assignVendorToServiceUnit = async (req, res) => {
  const { quotationId, packageId, serviceId, unitIndex } = req.params;
  const { vendorId, vendorName, slot, eventStartDate, eventEndDate } = req.body;

  try {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const pkg = quotation.packages.id(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const service = pkg.services.id(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const unit = parseInt(unitIndex, 10);
    const qty = Math.max(1, service.qty || 1);
    if (Number.isNaN(unit) || unit < 0 || unit >= qty) {
      return res.status(400).json({ success: false, message: "Invalid unitIndex" });
    }

    // Ensure array capacity
    service.assignedVendors = ensureCapacity(service.assignedVendors, qty);

    // 🔴 Always remove old VendorInventory for this unit
    await VendorInventory.deleteOne({
      quotationId: quotation._id,
      packageId: pkg._id.toString(),
      serviceId: service._id.toString(),
      unitIndex: unit,
    });

    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

      const finalVendorName = vendorName || vendor.name;

      // 🛑 Prevent overlapping booking
      const existingBookings = await VendorInventory.find({ vendorId });
      const overlap = existingBookings.some((b) => {
        if (!hasOverlap(eventStartDate, eventEndDate, b.eventStartDate, b.eventEndDate)) return false;
        return slot === "Full Day" || b.slot === "Full Day" || b.slot === slot;
      });

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: `Vendor ${finalVendorName} already booked between ${eventStartDate} and ${eventEndDate} (${slot})`,
        });
      }

      // ✅ Assign new vendor
      service.assignedVendors[unit] = {
        vendorId: new mongoose.Types.ObjectId(vendorId),
        vendorName: finalVendorName,
        category: vendor.category,
        assignedDate: new Date(),
        slot,
        eventStartDate,
        eventEndDate,
        salary: vendor.specialization.find((s) => s.name === service.serviceName)?.salary || 0,
        paymentStatus: "Pending",
      };

      // Save to VendorInventory
      await VendorInventory.create({
        vendorId,
        vendorName: finalVendorName,
        quotationId: quotation._id,
        packageId: pkg._id.toString(),
        serviceId: service._id.toString(),
        unitIndex: unit,
        eventStartDate: normalizeDate(eventStartDate),
        eventEndDate: normalizeDate(eventEndDate),
        slot,
      });
    } else {
      service.assignedVendors[unit] = null;
    }

    await quotation.save();

    return res.status(200).json({
      success: true,
      message: vendorId
        ? `Vendor ${vendorName} assigned to ${service.serviceName} (unit ${unit + 1}/${qty})`
        : `Vendor cleared for ${service.serviceName} (unit ${unit + 1}/${qty})`,
      service: service.toObject(),
    });
  } catch (err) {
    console.error("assignVendorToServiceUnit error:", err.message, err.stack);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.assignAssistantToServiceUnit = async (req, res) => {
  const { quotationId, packageId, serviceId, unitIndex } = req.params;
  const { assistantId, assistantName, slot, eventStartDate, eventEndDate } = req.body;

  try {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const pkg = quotation.packages.id(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    const service = pkg.services.id(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const unit = parseInt(unitIndex, 10);
    const qty = Math.max(1, service.qty || 1);
    if (Number.isNaN(unit) || unit < 0 || unit >= qty) {
      return res.status(400).json({ success: false, message: "Invalid unitIndex" });
    }

    // Ensure array capacity
    service.assignedAssistants = ensureCapacity(service.assignedAssistants, qty);

    // 🔴 Always remove old VendorInventory for this unit
    await VendorInventory.deleteOne({
      quotationId: quotation._id,
      packageId: pkg._id.toString(),
      serviceId: service._id.toString(),
      unitIndex: unit,
    });

    if (assistantId) {
      const asst = await Vendor.findById(assistantId);
      if (!asst) return res.status(404).json({ success: false, message: "Assistant vendor not found" });

      const finalAsstName = assistantName || asst.name;

      // 🛑 Prevent overlap
      const existingBookings = await VendorInventory.find({ vendorId: assistantId });
      const overlap = existingBookings.some((b) => {
        if (!hasOverlap(eventStartDate, eventEndDate, b.eventStartDate, b.eventEndDate)) return false;
        return slot === "Full Day" || b.slot === "Full Day" || b.slot === slot;
      });

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: `Assistant ${finalAsstName} already booked between ${eventStartDate} and ${eventEndDate} (${slot})`,
        });
      }

      // ✅ Assign new assistant
      service.assignedAssistants[unit] = {
        assistantId: new mongoose.Types.ObjectId(assistantId),
        assistantName: finalAsstName,
        category: asst.category,
        slot,
        eventStartDate,
        eventEndDate,
      };

      // Save to VendorInventory
      await VendorInventory.create({
        vendorId: assistantId,
        vendorName: finalAsstName,
        quotationId: quotation._id,
        packageId: pkg._id.toString(),
        serviceId: service._id.toString(),
        unitIndex: unit,
        eventStartDate: normalizeDate(eventStartDate),
        eventEndDate: normalizeDate(eventEndDate),
        slot,
      });
    } else {
      service.assignedAssistants[unit] = null;
    }

    await quotation.save();

    return res.status(200).json({
      success: true,
      message: assistantId
        ? `Assistant ${assistantName} assigned to ${service.serviceName} (unit ${unit + 1}/${qty})`
        : `Assistant cleared for ${service.serviceName} (unit ${unit + 1}/${qty})`,
      service: service.toObject(),
    });
  } catch (err) {
    console.error("assignAssistantToServiceUnit error:", err.message, err.stack);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



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
    const today = new Date().toISOString().slice(0, 10);

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

exports.getBookedAndCompletedQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    // Filter for Booked and Completed statuses
    const filter = {
      bookingStatus: { $in: ["Booked", "Completed"] },
      ...(search && { quotationId: { $regex: searchRegex } }),
    };

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .populate({
          path: "leadId",
          select: "persons", // Only get persons from lead
        })
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      quotations,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching booked/completed quotations:", error);
    res.status(500).json({
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
    return res
      .status(400)
      .json({ success: false, message: "Instruction cannot be empty." });
  }

  try {
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      quotationId,
      { $push: { clientInstructions: instruction } },
      { new: true }
    );

    if (!updatedQuotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instruction added successfully.",
      clientInstructions: updatedQuotation.clientInstructions,
    });
  } catch (error) {
    console.error("Add Instruction Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
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
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instruction deleted successfully.",
      clientInstructions: updatedQuotation.clientInstructions,
    });
  } catch (error) {
    console.error("Delete Instruction Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
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

exports.recordPayment = async (req, res) => {
  try {
    const { quotationId, installmentId } = req.params;
    const { paymentAmount, paymentMode, paymentDate, status } = req.body;

    // Find the quotation
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    // Find the specific installment
    const installmentIndex = quotation.installments.findIndex(
      (inst) => inst._id.toString() === installmentId
    );

    if (installmentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Installment not found" });
    }

    const installment = quotation.installments[installmentIndex];

    // Validate the payment amount
    if (paymentAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Payment amount must be positive" });
    }

    if (paymentAmount > installment.pendingAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds pending amount",
      });
    }

    // Calculate new values
    const newPaidAmount = (installment.paidAmount || 0) + paymentAmount;
    const newPendingAmount = installment.pendingAmount - paymentAmount;
    const newStatus =
      newPendingAmount <= 0 ? "Completed" : status || "Partial Paid";

    // Update the installment with all payment details
    quotation.installments[installmentIndex] = {
      ...installment.toObject(), // Keep all existing fields
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      status: newStatus,
      paymentMode: paymentMode || installment.paymentMode, // Use new mode or keep existing
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current date
      dueDate: installment.dueDate, // Preserve original due date
    };

    // Save the updated quotation
    const updatedQuotation = await quotation.save();

    return res.json({
      success: true,
      message: "Payment recorded successfully",
      installment: updatedQuotation.installments[installmentIndex],
      quotation: updatedQuotation,
    });
  } catch (err) {
    console.error("Payment recording error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: err.message,
    });
  }
};

// PUT /api/quotations/:id/booking-status
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, queryId } = req.body;

//     // const finalStatus = status ?? "Completed";
//     const finalStatus = status ?? "Booked";
//     const allowed = ["NotBooked", "Booked", "Completed"];
//     if (!allowed.includes(finalStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Allowed: ${allowed.join(", ")}`,
//       });
//     }

//     const filter = mongoose.isValidObjectId(id)
//       ? { _id: id }
//       : { quotationId: id }; // use human id when not ObjectId

//     const updated = await Quotation.findOneAndUpdate(
//       filter,
//       { $set: { bookingStatus: finalStatus } },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({
//         success: false,
//         message: "Quotation not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Booking status updated",
//       quotation: updated,
//     });
//   } catch (err) {
//     console.error("updateBookingStatus error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update booking status",
//       error: err.message,
//     });
//   }
// };

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, queryId } = req.body;

    const finalStatus = status ?? "Booked";
    const allowed = ["NotBooked", "Booked", "Completed"];
    if (!allowed.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    // -------- Update Quotation --------
    const filter = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { quotationId: id }; // use human id when not ObjectId

    const updatedQuotation = await Quotation.findOneAndUpdate(
      filter,
      { $set: { bookingStatus: finalStatus } },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    // -------- Update Query by queryId --------
    let updatedQuery = null;
    if (queryId) {
      updatedQuery = await Query.findOneAndUpdate(
        { queryId: queryId },
        { $set: { status: finalStatus } },
        { new: true }
      );
    }

    return res.json({
      success: true,
      message: "Booking status updated successfully",
      quotation: updatedQuotation,
      query: updatedQuery,
    });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: err.message,
    });
  }
};

// In your backend routes file (e.g., routes/quotations.js)
exports.getQuotaionByQueryId = async (req, res) => {
  try {
    const { queryId } = req.params;

    const bookedQuotations = await Quotation.find({
      queryId: queryId,
      bookingStatus: "Booked",
    }).populate("leadId"); // Populate lead data if needed

    res.json({
      success: true,
      data: bookedQuotations,
      count: bookedQuotations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booked quotations",
      error: error.message,
    });
  }
};

exports.countPendingPaymentQuotations = async (req, res) => {
  try {
    const pendingQuotations = await Quotation.find({
      bookingStatus: "Booked",
      "installments.status": { $in: ["Pending", "Partial Paid"] },
    });

    res.status(200).json({
      success: true,
      count: pendingQuotations.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not retrieve pending payment count",
      error: error.message,
    });
  }
};

exports.countTodaysEvents = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const count = await Quotation.countDocuments({
      bookingStatus: "Booked",
      $or: [
        // Events that start today and have no end date (single day events)
        {
          "packages.eventStartDate": today,
          "packages.eventEndDate": { $exists: false },
        },
        // Events that start today (regardless of end date)
        { "packages.eventStartDate": today },
        // Events that are ongoing (today is between start and end dates)
        {
          "packages.eventStartDate": { $lte: today },
          "packages.eventEndDate": { $gte: today },
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: count,
      date: today,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not retrieve today's events count",
      error: error.message,
    });
  }
};

exports.countCompletedQuotations = async (req, res) => {
  try {
    const count = await Quotation.countDocuments({
      bookingStatus: "Completed",
    });

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not retrieve completed quotations count",
      error: error.message,
    });
  }
};

exports.updateCalculation = async (req, res) => {
  console.log("req.body calc", req.body);
  try {
    const { package: updatedPackage, ...totals } = req.body;

    // 1. Find the quotation
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    // 2. Update the specific package if provided
    if (updatedPackage && updatedPackage._id) {
      const packageIndex = quotation.packages.findIndex(
        (pkg) => pkg._id.toString() === updatedPackage._id
      );

      if (packageIndex !== -1) {
        // Replace the package with the updated one
        quotation.packages[packageIndex] = updatedPackage;
      } else {
        // If package not found but has _id, it might be an error
        return res.status(400).json({
          success: false,
          message: "Package not found in quotation",
        });
      }
    }

    // 3. Update all the calculated totals
    quotation.totalPackageAmt = totals.totalPackageAmt;
    quotation.totalAlbumAmount = totals.totalAlbumAmount;
    quotation.discountValue = totals.discountValue;
    quotation.gstValue = totals.gstValue;
    quotation.totalAmount = totals.totalAmount;
    quotation.grandTotal = totals.grandTotal;
    quotation.totalMarginFinal = totals.totalMarginFinal;

    // 4. Update installments while preserving accountHolders
    if (totals.installments && Array.isArray(totals.installments)) {
      // Create a map of existing installments by _id for accountHolders preservation
      const existingInstallmentsMap = new Map();
      quotation.installments.forEach((inst) => {
        if (inst._id) {
          existingInstallmentsMap.set(inst._id.toString(), inst);
        }
      });

      // Update installments with financial data but preserve accountHolders
      quotation.installments = totals.installments.map((newInst) => {
        // For installments with _id, preserve accountHolders from existing installment
        if (newInst._id) {
          const existingInst = existingInstallmentsMap.get(
            newInst._id.toString()
          );
          if (existingInst) {
            return {
              ...newInst,
              accountHolders: existingInst.accountHolders || [], // Preserve account holders
            };
          }
        }

        // For new installments or those without matching existing ones
        return {
          ...newInst,
          accountHolders: newInst.accountHolders || [], // Use provided or empty array
        };
      });
    }

    // 5. Save the updated quotation
    const updatedQuotation = await quotation.save();

    res.json({
      success: true,
      quotation: updatedQuotation,
    });
  } catch (err) {
    console.error("Error updating quotation:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: err.message,
    });
  }
};

exports.updateInstallmentStatus = async (req, res) => {
  try {
    const { quotationId, installmentId } = req.params;
    const {
      dueDate,
      paymentMode,
      paymentPercentage,
      paymentAmount,
      status,
      accountHolders,
    } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    if (installmentId !== "new") {
      const installment = quotation.installments.find(
        (inst) => String(inst._id) === String(installmentId)
      );
      if (!installment) {
        return res
          .status(404)
          .json({ success: false, message: "Installment not found" });
      }

      // Update fields from request
      if (dueDate !== undefined) installment.dueDate = dueDate;
      if (paymentMode !== undefined) installment.paymentMode = paymentMode;
      if (paymentPercentage !== undefined)
        installment.paymentPercentage = paymentPercentage;
      if (status !== undefined) installment.status = status;

      // ✅ Handle account holders - prevent duplicates
      if (accountHolders && Array.isArray(accountHolders)) {
        const newHolders = accountHolders.map((h) => ({ name: h.name }));

        // Merge with existing holders, avoiding duplicates
        const existingHolderNames = new Set(
          (installment.accountHolders || []).map((h) => h.name.toLowerCase())
        );
        const uniqueNewHolders = newHolders.filter(
          (h) => !existingHolderNames.has(h.name.toLowerCase())
        );

        installment.accountHolders = [
          ...(installment.accountHolders || []),
          ...uniqueNewHolders,
        ];
      }

      if (paymentAmount !== undefined) {
        installment.paymentAmount = paymentAmount;

        if (status === "Completed") {
          installment.paidAmount = paymentAmount;
          installment.pendingAmount = 0;
        } else if (status === "Partial Paid") {
          // Add the new payment to previous paidAmount
          const prevPaid = Number(installment.paidAmount) || 0;
          const newPaid = Number(req.body.paidAmount) || 0; // <-- frontend should send paidAmount as the amount being paid now
          installment.paidAmount = prevPaid + newPaid;
          installment.pendingAmount = Math.max(
            0,
            paymentAmount - installment.paidAmount
          );
          // If fully paid, mark as completed
          if (installment.paidAmount >= paymentAmount) {
            installment.status = "Completed";
            installment.pendingAmount = 0;
          }
        } else {
          // Pending status
          installment.paidAmount = 0;
          installment.pendingAmount = paymentAmount;
        }
      }

      // business rule for first installment
      const firstInstallment = quotation.installments[0];
      if (
        firstInstallment &&
        String(firstInstallment._id) === String(installmentId) &&
        installment.status === "Completed"
      ) {
        quotation.bookingStatus = "Booked";
        if (quotation.queryId) {
          await Query.findOneAndUpdate(
            { _id: quotation.queryId },
            { status: "Booked" }
          );
        }
      }
    } else {
      // For new installment, use status from frontend or default to Pending
      const newStatus = status || "Pending";
      const planned = paymentAmount ?? 0;

      // ✅ Handle account holders for new installment - remove duplicates
      const accountHoldersData =
        accountHolders && Array.isArray(accountHolders)
          ? accountHolders.map((h) => ({ name: h.name }))
          : [];

      // Remove duplicate names
      const uniqueHolders = [];
      const seenNames = new Set();

      accountHoldersData.forEach((holder) => {
        if (!seenNames.has(holder.name.toLowerCase())) {
          seenNames.add(holder.name.toLowerCase());
          uniqueHolders.push(holder);
        }
      });

      quotation.installments.push({
        dueDate,
        paymentMode,
        paymentPercentage,
        paymentAmount: planned,
        paidAmount: newStatus === "Completed" ? planned : 0,
        pendingAmount: newStatus === "Completed" ? 0 : planned,
        status: newStatus,
        accountHolders: uniqueHolders, // ✅ Add unique account holders
      });
    }

    await quotation.save();
    return res.status(200).json({ success: true, quotation });
  } catch (error) {
    console.error("Error updating/creating installment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update/create installment",
      error: error.message,
    });
  }
};

exports.updateInstallmentFirstPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quotationId, installmentId } = req.params;
    const { dueDate, paymentMode, paymentAmount, status, accountHolders } =
      req.body;

    const allowed = ["Pending", "Partial Paid", "Completed"];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const filter = mongoose.isValidObjectId(quotationId)
      ? { _id: quotationId }
      : { quotationId };

    const doc = await Quotation.findOne(filter).session(session);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    }

    const inst = doc.installments.id(installmentId);
    if (!inst) {
      return res
        .status(404)
        .json({ success: false, message: "Installment not found" });
    }

    // ✅ Update basic fields
    if (dueDate !== undefined) inst.dueDate = dueDate;
    if (paymentMode !== undefined) inst.paymentMode = paymentMode;
    if (status !== undefined) inst.status = status;

    // ✅ Update payment tracking
    const paidNow = Number(paymentAmount ?? inst.paymentAmount ?? 0);
    inst.paidAmount = paidNow;
    inst.pendingAmount = Math.max(0, (inst.paymentAmount || 0) - paidNow);

    // ✅ Merge account holders but only keep names (strip amount)
    if (accountHolders && Array.isArray(accountHolders)) {
      inst.accountHolders = [
        ...(inst.accountHolders || []),
        ...accountHolders.map((h) => ({ name: h.name })),
      ];
    }

    // ✅ Mark all other installments as pending with full amount
    doc.installments.forEach((i) => {
      if (i._id.toString() !== installmentId) {
        i.paidAmount = 0;
        i.pendingAmount = Number(i.paymentAmount ?? 0);
        i.status = "Pending";
      }
    });

    // ✅ Update booking status
    if (doc.bookingStatus !== "Completed") {
      doc.bookingStatus = "Booked";
    }

    await doc.save({ session });

    // ✅ Update linked Query as Booked if exists
    if (doc.queryId) {
      await Query.findByIdAndUpdate(
        doc.queryId,
        { $set: { status: "Booked" } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message:
        "First payment recorded; booking marked as Booked; other installments set to pending.",
      data: {
        quotationId: doc._id,
        updatedInstallment: doc.installments.id(installmentId),
        installments: doc.installments,
        bookingStatus: doc.bookingStatus,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateInstallmentFirstPayment error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to record first payment",
      error: err.message,
    });
  }
};

// Update WhatsApp group name or Note
exports.updateGroupOrNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { whatsappGroupName, note } = req.body;

    if (!whatsappGroupName && !note) {
      return res
        .status(400)
        .json({ success: false, message: "Either group name or note is required" });
    }

    const updated = await Quotation.findByIdAndUpdate(
      id,
      { ...(whatsappGroupName && { whatsappGroupName }), ...(note && { quoteNote: note }) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, quotation: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ Yearly Client Payments
exports.getYearlyClientPayments = async (req, res) => {
  try {
    const stats = await Quotation.getYearlyClientPayments();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➤ Yearly Vendor Payments
exports.getYearlyVendorPayments = async (req, res) => {
  try {
    const stats = await Quotation.getYearlyVendorPayments();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



