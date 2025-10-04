const express = require("express");
const router = express.Router();
const {
  createOrUpdateLead,
  addQueryAndPerson,
  getAllLeads,
  getAllQueriesPaginated,
  searchLeadByPhoneNo,
  searchLeadByPhonePrefix,
  getLeadWithSpecificQuery,
  updateQueryStatus,
  getLeadQueryDetails,
  updateLeadQueryDetails,
  getCreatedQueriesCount,
  getQueryWithStatus,
  getCallLaterQueriesbyDate,
  getQueriesbyEventstartDate,
  updatePersonDetails,
  getTodayRescheduledCalls
} = require("../Controllers/leadController");

// Route to create a new lead
router.post("/create", createOrUpdateLead);

// Route to add a query and new persons to an existing lead
router.post("/:leadId/addQueryAndPerson", addQueryAndPerson);

// Fetch all leads
router.get("/", getAllLeads);
router.get("/paginated", getAllQueriesPaginated);

router.get("/status/:status", getQueryWithStatus);
router.get("/call-later-by-date", getCallLaterQueriesbyDate);
router.get('/event-date/:startDate', getQueriesbyEventstartDate)

// Search leads by phone number
router.get("/searchByPhone", searchLeadByPhoneNo);

// Search leads by phone number prefix (first 3 digits)
router.get("/searchByPhonePrefix", searchLeadByPhonePrefix);

// router.get("/with-created-queries", getLeadsWithCreatedQueries);
router.get("/lead-details/:leadId/:queryId", getLeadWithSpecificQuery);
router.get("/count", getCreatedQueriesCount);
router.get("/queries/rescheduled/today", getTodayRescheduledCalls);
router.get("/lead-query-details/:leadId/:queryId", getLeadQueryDetails);
router.put("/:leadId/update-query/:queryId", updateLeadQueryDetails);

router.put("/:queryId/status", updateQueryStatus);
router.put("/:leadId/person/:personId",updatePersonDetails)

module.exports = router;
