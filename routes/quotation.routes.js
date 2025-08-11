const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getQuotationByQueryId,
  getQuotationById,
  toggleFinalizedQuotation,
  deleteInstallment,
  updateQuotation,
  updateInstallmentStatus,
  assignVendorToService,
  generateInvoiceNumber,
  deleteQuotation,
  getFinalizedQuotationsPaginated,
  getQuotationsByStatus,
  getBookedEventsByDate,
  getBookedEventsForToday,
  addClientInstruction,
  deleteClientInstruction,
  updateAllDataCollected,
} = require("../Controllers/quotationController");

router.post("/create", createQuotation);
router.get("/by-query/:queryId", getQuotationByQueryId);
router.get("/finalized", getFinalizedQuotationsPaginated);
router.get("/booked-events-by-date/:date", getBookedEventsByDate);
router.get("/booked-events-today", getBookedEventsForToday);

router.get("/status/:status", getQuotationsByStatus);

router.get("/:id", getQuotationById);
router.delete("/:id", deleteQuotation);
router.put("/:id", updateQuotation);
router.patch("/:id/finalize", toggleFinalizedQuotation);
router.post("/:id/generate-invoice", generateInvoiceNumber);

// New routes for installments and vendor assignment
// router.post("/quotations/:quotationId/installment", addInstallment);

router.put("/:quotationId/installment/:installmentId", updateInstallmentStatus);
router.put(
  "/assign-vendor/:quotationId/package/:packageId/service/:serviceName",
  assignVendorToService
);
router.delete("/:quotationId/installment/:installmentId", deleteInstallment);

router.put("/:quotationId/instruction/add", addClientInstruction);
router.delete("/:quotationId/instruction/delete", deleteClientInstruction);


module.exports = router;
