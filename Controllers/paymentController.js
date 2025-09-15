// controllers/paymentController.js
const Quotation = require("../models/quotation.model");
const Lead = require("../models/lead");


// exports.getCompletedInstallments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) ;
//     const limit = parseInt(req.query.limit);
//     const search = (req.query.search || "").trim().toLowerCase();

//     // sorting controls
//     const sortBy = (req.query.sortBy || "dueDate").toLowerCase(); // name|dueDate|quotation|createdAt
//     const sortDir = (req.query.sortDir || "desc").toLowerCase() === "asc" ? 1 : -1;

//     const skip = (page - 1) * limit;

//     const quotations = await Quotation.find({
//       "installments.status": "Completed",
//     })
//       .populate({ path: "leadId", select: "persons leadId" })
//       .populate({ path: "queryId", select: "queryId" })
//       .sort({ updatedAt: -1 }) // DB-level fallback order
//       .lean();

//     // helpers
//     const toDate = (d) => {
//       if (!d) return null;
//       // supports "DD-MM-YYYY" and ISO-like
//       const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
//       if (ddmmyyyy.test(d)) {
//         const [, dd, mm, yyyy] = d.match(ddmmyyyy);
//         const iso = `${yyyy}-${mm}-${dd}T00:00:00Z`;
//         const dt = new Date(iso);
//         return isNaN(dt) ? null : dt;
//       }
//       const dt = new Date(d);
//       return isNaN(dt) ? null : dt;
//     };

//     let payments = quotations.map((q) => {
//       const firstPerson = q.leadId?.persons?.[0] || {};
//       const completed = (q.installments || []).filter((i) => i.status === "Completed");

//       // sort the completed installments (stable view)
//       completed.sort((a, b) => {
//         // primary by installmentNumber asc (fallback if missing)
//         const aN = a.installmentNumber ?? 0;
//         const bN = b.installmentNumber ?? 0;
//         if (aN !== bN) return aN - bN;
//         // secondary by dueDate asc
//         const aD = toDate(a.dueDate)?.getTime() ?? 0;
//         const bD = toDate(b.dueDate)?.getTime() ?? 0;
//         return aD - bD;
//       });

//       // key for outer sorting: latest completed due date
//       const latestDueMs = Math.max(
//         ...completed.map((i) => toDate(i.dueDate)?.getTime() ?? -Infinity)
//       );

//       return {
//         sortKeys: {
//           latestDueMs,
//           name: (firstPerson.name || "").toLowerCase(),
//           quotation: (q.quotationId || ""),
//           createdAtMs: new Date(q.createdAt).getTime() || 0,
//         },
//         quotationId: q._id,
//         quotationNumber: q.quotationId,
//         leadId: q.leadId?.leadId,
//         queryId: q.queryId?.queryId,
//         firstPersonName: firstPerson.name || "N/A",
//         firstPersonPhone: firstPerson.phoneNo || "N/A",
//         totalCompletedInstallments: completed.length,
//         completedInstallments: completed.map((inst) => ({
//           installmentNumber: inst.installmentNumber,
//           amount: inst.paymentAmount,
//           dueDate: inst.dueDate,
//           mode: inst.paymentMode,
//         })),
//       };
//     });

//     // search filter
//     if (search) {
//       payments = payments.filter(
//         (p) =>
//           p.firstPersonName.toLowerCase().includes(search) ||
//           (p.firstPersonPhone || "").includes(search)
//       );
//     }

//     // outer sort
//     const cmp = (a, b) => {
//       const dir = sortDir;
//       switch (sortBy) {
//         case "name":
//           return a.sortKeys.name < b.sortKeys.name ? -1 * dir : a.sortKeys.name > b.sortKeys.name ? 1 * dir : 0;
//         case "quotation":
//           return a.sortKeys.quotation < b.sortKeys.quotation ? -1 * dir : a.sortKeys.quotation > b.sortKeys.quotation ? 1 * dir : 0;
//         case "createdat":
//           return (a.sortKeys.createdAtMs - b.sortKeys.createdAtMs) * dir;
//         case "duedate":
//         default:
//           // latest completed due date
//           return (a.sortKeys.latestDueMs - b.sortKeys.latestDueMs) * dir;
//       }
//     };
//     payments.sort(cmp);

//     // paginate
//     const totalCount = payments.length;
//     const paginatedData = payments.slice(skip, skip + limit);

//     return res.status(200).json({
//       success: true,
//       count: totalCount,
//       currentPage: page,
//       totalPages: Math.ceil(totalCount / limit),
//       data: paginatedData,
//     });
//   } catch (error) {
//     console.error("Error fetching completed installments:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch completed installments",
//       error: error.message,
//     });
//   }
// };


exports.getCompletedInstallments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search || "").trim().toLowerCase();
    const all = req.query.all === "true"; // 👈 detect all=true

    // sorting controls
    const sortBy = (req.query.sortBy || "dueDate").toLowerCase();
    const sortDir =
      (req.query.sortDir || "desc").toLowerCase() === "asc" ? 1 : -1;

    const quotations = await Quotation.find({
      "installments.status": "Completed",
    })
      .populate({ path: "leadId", select: "persons leadId" })
      .populate({ path: "queryId", select: "queryId" })
      .sort({ updatedAt: -1 })
      .lean();

    const toDate = (d) => {
      if (!d) return null;
      const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
      if (ddmmyyyy.test(d)) {
        const [, dd, mm, yyyy] = d.match(ddmmyyyy);
        return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
      }
      const dt = new Date(d);
      return isNaN(dt) ? null : dt;
    };

    let payments = quotations.map((q) => {
      const firstPerson = q.leadId?.persons?.[0] || {};
      const completed = (q.installments || []).filter(
        (i) => i.status === "Completed"
      );

      completed.sort((a, b) => {
        const aN = a.installmentNumber ?? 0;
        const bN = b.installmentNumber ?? 0;
        if (aN !== bN) return aN - bN;
        return (toDate(a.dueDate)?.getTime() ?? 0) - (toDate(b.dueDate)?.getTime() ?? 0);
      });

      const latestDueMs = Math.max(
        ...completed.map((i) => toDate(i.dueDate)?.getTime() ?? -Infinity)
      );

      return {
        sortKeys: {
          latestDueMs,
          name: (firstPerson.name || "").toLowerCase(),
          quotation: q.quotationId || "",
          createdAtMs: new Date(q.createdAt).getTime() || 0,
        },
        quotationId: q._id,
        quotationNumber: q.quotationId,
        leadId: q.leadId?.leadId,
        queryId: q.queryId?.queryId,
        firstPersonName: firstPerson.name || "N/A",
        firstPersonPhone: firstPerson.phoneNo || "N/A",
        totalCompletedInstallments: completed.length,
        completedInstallments: completed.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          amount: inst.paymentAmount,
          dueDate: inst.dueDate,
          mode: inst.paymentMode,
        })),
      };
    });

    if (search) {
      payments = payments.filter(
        (p) =>
          p.firstPersonName.toLowerCase().includes(search) ||
          (p.firstPersonPhone || "").includes(search)
      );
    }

    // outer sort
    const cmp = (a, b) => {
      const dir = sortDir;
      switch (sortBy) {
        case "name":
          return a.sortKeys.name.localeCompare(b.sortKeys.name) * dir;
        case "quotation":
          return a.sortKeys.quotation.localeCompare(b.sortKeys.quotation) * dir;
        case "createdat":
          return (a.sortKeys.createdAtMs - b.sortKeys.createdAtMs) * dir;
        case "duedate":
        default:
          return (a.sortKeys.latestDueMs - b.sortKeys.latestDueMs) * dir;
      }
    };
    payments.sort(cmp);

    const totalCount = payments.length;

    // ✅ if all=true → return everything (ignore pagination)
    if (all) {
      return res.status(200).json({
        success: true,
        count: totalCount,
        currentPage: 1,
        totalPages: 1,
        data: payments,
      });
    }

    // otherwise, paginate
    const skip = (page - 1) * limit;
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

