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
  // assignVendorToService,
  generateInvoiceNumber,
  deleteQuotation,
  getFinalizedQuotationsPaginated,
  getQuotationsByStatus,
  getBookedEventsByDate,
  getBookedEventsForToday,
  addClientInstruction,
  deleteClientInstruction,

  assignVendorToServiceUnit,
  assignAssistantToServiceUnit,
  updateCalculation,
  recordPayment,
  updateBookingStatus,
  updateInstallmentFirstPayment,
  getBookedAndCompletedQuotations,
  getQuotaionByQueryId,
  countPendingPaymentQuotations,
  countTodaysEvents,
  countCompletedQuotations
} = require("../Controllers/quotationController");

router.post("/create", createQuotation);
router.get("/by-query/:queryId", getQuotationByQueryId);
router.get("/finalized", getFinalizedQuotationsPaginated);
router.get("/booked-events-by-date/:date", getBookedEventsByDate);
router.get("/booked-events-today", getBookedEventsForToday);



router.get("/status/:status", getQuotationsByStatus);
router.get("/booked-completed", getBookedAndCompletedQuotations);
router.get('/booked-by-query/:queryId', getQuotaionByQueryId)
router.get('/count/pending-payments', countPendingPaymentQuotations);
router.get('/count/todays-events', countTodaysEvents);
router.get('/count/completed', countCompletedQuotations)

router.get("/:id", getQuotationById);
router.delete("/:id", deleteQuotation);
router.put("/:id", updateQuotation);
router.patch("/:id/finalize", toggleFinalizedQuotation);
router.post("/:id/generate-invoice", generateInvoiceNumber);
router.put('/:id/totals-min', updateCalculation)
router.put("/:id/booking-status", updateBookingStatus);



router.put("/:quotationId/installment/:installmentId", updateInstallmentStatus);
router.put("/:quotationId/installment/:installmentId/payment", recordPayment);
router.put("/:quotationId/installments/:installmentId/first-payment", updateInstallmentFirstPayment);

// Vendor per unit
router.put(
  "/:quotationId/package/:packageId/service/:serviceId/unit/:unitIndex/assign-vendor",
  assignVendorToServiceUnit
);

// Assistant per unit
router.put(
  "/:quotationId/package/:packageId/service/:serviceId/unit/:unitIndex/assign-assistant",
  assignAssistantToServiceUnit
);
router.delete("/:quotationId/installment/:installmentId", deleteInstallment);

router.put("/:quotationId/instruction/add", addClientInstruction);
router.delete("/:quotationId/instruction/delete", deleteClientInstruction);

module.exports = router;


