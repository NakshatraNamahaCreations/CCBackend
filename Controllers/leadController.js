

const Lead = require("../models/lead");
const Query = require("../models/query");
const Category = require("../models/category");
const mongoose = require("mongoose");

// Function to generate a new unique lead ID (CC-Cust001, CC-Cust002, etc.)
const generateLeadId = async () => {
  const lastLead = await Lead.findOne().sort({ _id: -1 }).limit(1); // Get the last created lead
  const lastLeadId = lastLead ? lastLead.leadId : "CC-Cust000";
  const leadNumber = parseInt(lastLeadId.split("-")[1].slice(4)) + 1;
  return `CC-Cust${String(leadNumber).padStart(3, "0")}`;
};

// Function to generate a new unique query ID (CC-Query001, CC-Query002, etc.)
async function generateQueryId() {
  const lastQuery = await Query.findOne().sort({ createdAt: -1 });
  let nextId = "CC-Query001";
  if (lastQuery) {
    const lastIdNum = parseInt(lastQuery.queryId.split("CC-Query")[1]) || 0;
    nextId = `CC-Query${String(lastIdNum + 1).padStart(3, "0")}`;
  }
  return nextId;
}

// Search Lead by Phone Number Prefix (first 3 digits)
exports.searchLeadByPhonePrefix = async (req, res) => {
  try {
    const { prefix } = req.query;
    if (!prefix || prefix.length < 3) {
      return res.status(400).json({ message: "Prefix (3 digits) is required" });
    }

    const regex = new RegExp(`^${prefix}`, "i");
    const leads = await Lead.find({ "persons.phoneNo": { $regex: regex } })
      .populate("queries")
      .lean();

    if (!leads || leads.length === 0) {
      return res
        .status(404)
        .json({ message: "No leads found with this phone number prefix" });
    }

    const suggestions = leads.flatMap((lead) =>
      lead.persons.map((person) => person.phoneNo)
    );
    res.status(200).json(suggestions);
  } catch (err) {
    console.error("Error in searchLeadByPhonePrefix:", err);
    res
      .status(500)
      .json({ message: "Error fetching lead suggestions", error: err.message });
  }
};

// Create or Update Lead (Create New Lead Only with Initial Query)
exports.createOrUpdateLead = async (req, res) => {
  try {
    const { persons, eventDetails, referenceForm, createdDate } = req.body;

    // Validate input data
    if (!persons || !Array.isArray(persons) || persons.length === 0) {
      return res
        .status(400)
        .json({ message: "Persons array is required and cannot be empty" });
    }

    if (
      !eventDetails ||
      !Array.isArray(eventDetails) ||
      eventDetails.length === 0
    ) {
      return res.status(400).json({ message: "Event details are required" });
    }

    if (!referenceForm) {
      return res.status(400).json({ message: "Reference form is required" });
    }

    // Validate persons data
    for (const person of persons) {
      if (!person.name || !person.phoneNo || !person.email) {
        return res
          .status(400)
          .json({ message: "Each person must have name, phoneNo, and email" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(person.email)) {
        return res
          .status(400)
          .json({ message: `Invalid email format for ${person.email}` });
      }
   
    }

    // Check if any phone number already exists in the database
    const existingLead = await Lead.findOne({
      "persons.phoneNo": { $in: persons.map((p) => p.phoneNo) },
    });

    if (existingLead) {
      return res.status(400).json({
        message: `${persons[0].phoneNo} number is already registered. Please check in the search box.`,
      });
    }

    // Generate a new lead ID
    const leadId = await generateLeadId();

    // Create a new query document with eventDetails
    const queryDoc = new Query({
      eventDetails: eventDetails.map((event) => ({
        category: event.category,
        eventStartDate: new Date(event.eventStartDate),
        eventEndDate: new Date(event.eventEndDate),
      })),
      queryId: await generateQueryId(), // Assign a unique query ID
      status: "Created", // ✅ set status here
    });
    await queryDoc.save();

    // Create the new lead with the initial query
    const lead = new Lead({
      leadId,
      persons,
      referenceForm,
      createdAt: createdDate ? new Date(createdDate) : new Date(),
      queries: [queryDoc._id], // Associate the new query with the lead
    });

    await lead.save();

    // Populate the lead with the query details
    const populatedLead = await Lead.findById(lead._id)
      .populate("queries")
      .lean();

    return res.status(201).json({
      message: "Lead created successfully with initial query",
      lead: populatedLead,
    });
  } catch (err) {
    console.error("Error creating lead:", err);
    res
      .status(500)
      .json({ message: "Error creating lead", error: err.message });
  }
};

// Route handler to add a query and new persons to an existing lead
// exports.addQueryAndPerson = async (req, res) => {
//   try {
//     const { leadId } = req.params;
//     const { persons, eventDetails } = req.body;

//     // Validate input data
//     if (!persons || !Array.isArray(persons) || persons.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Persons array is required and cannot be empty" });
//     }

//     if (
//       !eventDetails ||
//       !Array.isArray(eventDetails) ||
//       eventDetails.length === 0
//     ) {
//       return res.status(400).json({ message: "Event details are required" });
//     }

//     // Find the existing lead by _id
//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     // Check for duplicate phone numbers in existing persons
//     const existingPhoneNumbers = lead.persons.map((p) => p.phoneNo);
//     const newPhoneNumbers = persons.map((p) => p.phoneNo);
//     const duplicatePhone = newPhoneNumbers.find((phone) =>
//       existingPhoneNumbers.includes(phone)
//     );
//     if (duplicatePhone) {
//       return res.status(400).json({
//         message: `${duplicatePhone} is already registered with this lead.`,
//       });
//     }

//     // Generate a new queryId
//     const queryId = await generateQueryId(); // Ensure this function is defined and imported

//     // Create a new query document
//     const query = new Query({
//       queryId, // Assign the generated queryId
//       eventDetails: eventDetails.map((event) => ({
//         category: event.category,
//         eventStartDate: new Date(event.eventStartDate),
//         eventEndDate: new Date(event.eventEndDate),
//       })),
//       status: "Created", // ✅ set status here
//     });
//     await query.save();

//     // Add new persons to the lead
//     lead.persons.push(...persons);

//     // Add the new query to the lead's queries array
//     lead.queries.push(query._id);

//     // Save the updated lead
//     await lead.save();

//     // Populate the lead with query details for the response
//     const populatedLead = await Lead.findById(lead._id)
//       .populate("queries")
//       .lean();

//     return res.status(200).json({
//       message: "Query and persons added successfully",
//       lead: populatedLead,
//     });
//   } catch (err) {
//     console.error("Error adding query and persons:", err);
//     res
//       .status(500)
//       .json({ message: "Error adding query and persons", error: err.message });
//   }
// };

exports.addQueryAndPerson = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { persons, eventDetails } = req.body;

    // ✅ Persons are optional → filter only valid entries
    const personsToAdd = Array.isArray(persons)
      ? persons.filter((p) => p.name && p.phoneNo)
      : [];

    if (
      !eventDetails ||
      !Array.isArray(eventDetails) ||
      eventDetails.length === 0
    ) {
      return res.status(400).json({ message: "Event details are required" });
    }

    // Find the existing lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // ✅ Check for duplicate phone numbers only if persons provided
    if (personsToAdd.length > 0) {
      const existingPhoneNumbers = lead.persons.map((p) => p.phoneNo);
      const duplicatePhone = personsToAdd.find((p) =>
        existingPhoneNumbers.includes(p.phoneNo)
      );
      if (duplicatePhone) {
        return res.status(400).json({
          message: `${duplicatePhone.phoneNo} is already registered with this lead.`,
        });
      }
    }

    // Generate a new queryId
    const queryId = await generateQueryId(); // Ensure this function exists

    // Create a new query document
    const query = new Query({
      queryId,
      eventDetails: eventDetails.map((event) => ({
        category: event.category,
        eventStartDate: new Date(event.eventStartDate),
        eventEndDate: new Date(event.eventEndDate),
      })),
      status: "Created",
    });
    await query.save();

    // ✅ Only add persons if provided
    if (personsToAdd.length > 0) {
      lead.persons.push(...personsToAdd);
    }

    // Add the new query to the lead
    lead.queries.push(query._id);

    // Save the updated lead
    await lead.save();

    // Populate for response
    const populatedLead = await Lead.findById(lead._id)
      .populate("queries")
      .lean();

    return res.status(200).json({
      message: `Query added successfully${
        personsToAdd.length > 0 ? " with new persons" : ""
      }`,
      lead: populatedLead,
    });
  } catch (err) {
    console.error("Error adding query and persons:", err);
    res.status(500).json({
      message: "Error adding query and persons",
      error: err.message,
    });
  }
};


// Fetch All Leads
exports.getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) ;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Search filter on name or phone number of first person
    const filter = search
      ? {
          $or: [
            { "persons.name": { $regex: search, $options: "i" } },
            { "persons.phoneNo": { $regex: search, $options: "i" } },
            { "leadId": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate("queries")
      .sort({ createdAt: -1 }) // 👈 Sort by creation date, newest first
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (err) {
    console.error("Error fetching leads:", err);
    res
      .status(500)
      .json({ message: "Error fetching leads", error: err.message });
  }
};

// GET /api/lead/paginated?page=1&limit=10&search=...
exports.getAllQueriesPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, "i");

    // Aggregate pipeline
    const pipeline = [
      { $unwind: "$queries" },
      {
        $lookup: {
          from: "queries",
          localField: "queries",
          foreignField: "_id",
          as: "query"
        }
      },
      { $unwind: "$query" },
      // Move $match here so it works on the correct fields
      ...(search
        ? [{
            $match: {
              $or: [
                { "persons.name": { $regex: searchRegex } },
                { "persons.phoneNo": { $regex: searchRegex } },
                { "query.queryId": { $regex: searchRegex } }
              ]
            }
          }]
        : []),
      {
        $project: {
          leadId: "$_id",
          leadName: { $arrayElemAt: ["$persons.name", 0] },
          leadPhone: { $arrayElemAt: ["$persons.phoneNo", 0] },
          query: 1
        }
      },
      { $sort: { "query.createdAt": -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    // For total count
    const countPipeline = pipeline.filter(stage => !("$skip" in stage) && !("$limit" in stage)).concat([{ $count: "total" }]);

    const [results, totalResult] = await Promise.all([
      Lead.aggregate(pipeline),
      Lead.aggregate(countPipeline)
    ]);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: results,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (err) {
    console.error("Error fetching queries:", err);
    res.status(500).json({ message: "Error fetching queries", error: err.message });
  }
};


// Search Lead by Phone Number
exports.searchLeadByPhoneNo = async (req, res) => {
  try {
    const { phoneNo } = req.query;
    if (!phoneNo) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const leads = await Lead.find({ "persons.phoneNo": phoneNo })
      .populate("queries")
      .lean();

    if (!leads || leads.length === 0) {
      return res
        .status(404)
        .json({ message: "No lead found with this phone number" });
    }

    res.status(200).json(leads);
  } catch (err) {
    console.error("Error in searchLeadByPhoneNo:", err);
    res
      .status(500)
      .json({ message: "Error fetching lead", error: err.message });
  }
};

// controller/leadController.js
exports.getLeadWithSpecificQuery = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;

    const lead = await Lead.findById(leadId).lean();
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const queryObj = lead.queries.find((q) => q.toString() === queryId);
    if (!queryObj)
      return res.status(404).json({ message: "Query not found for this lead" });

    const fullQuery = await Query.findById(queryId).lean();
    if (!fullQuery) return res.status(404).json({ message: "Query not found" });

    return res.status(200).json({
      success: true,
      data: {
        lead,
        query: fullQuery,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getLeadQueryDetails = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;

    console.log("GET LEAD QUERY DETAILS:");
    console.log("leadId:", leadId);
    console.log("queryId:", queryId);

    if (
      !mongoose.Types.ObjectId.isValid(leadId) ||
      !mongoose.Types.ObjectId.isValid(queryId)
    ) {
      return res.status(400).json({ message: "Invalid leadId or queryId" });
    }

    const lead = await Lead.findById(leadId).lean();
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const isLinked = lead.queries.some((q) => q.toString() === queryId);
    if (!isLinked)
      return res
        .status(404)
        .json({ message: "Query not associated with this lead" });

    const query = await Query.findById(queryId).lean();
    if (!query) return res.status(404).json({ message: "Query not found" });

    // Attach query details directly to lead
    lead.queryDetails = query;

    return res.json({ lead });
  } catch (err) {
    console.error("Error in getLeadQueryDetails:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateLeadQueryDetails = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;
    const { newPersons, updatedEventDetails, newEventDetails } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(leadId) ||
      !mongoose.Types.ObjectId.isValid(queryId)
    ) {
      return res.status(400).json({ message: "Invalid leadId or queryId" });
    }

    // 1. Update Lead -> only append new persons
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (Array.isArray(newPersons)) {
      lead.persons.push(...newPersons);
    }

    // 2. Ensure query is linked to the lead
    const isLinked = lead.queries.some((qId) => qId.toString() === queryId);
    if (!isLinked)
      return res
        .status(404)
        .json({ message: "Query not associated with this lead" });

    // 3. Fetch the Query document
    const query = await Query.findById(queryId);
    if (!query) return res.status(404).json({ message: "Query not found" });

    // 4. Update existing event details by matching _id
    if (Array.isArray(updatedEventDetails)) {
      query.eventDetails = query.eventDetails.map((existing) => {
        const updated = updatedEventDetails.find(
          (u) => u._id?.toString() === existing._id.toString()
        );
        return updated
          ? {
              ...existing.toObject(),
              eventStartDate: updated.eventStartDate,
              eventEndDate: updated.eventEndDate,
            }
          : existing;
      });
    }

    // 5. Append new event details
    if (Array.isArray(newEventDetails)) {
      query.eventDetails.push(...newEventDetails);
    }

    // 6. Save both
    await lead.save();
    await query.save();

    res.json({ success: true, message: "Lead and Query updated successfully" });
  } catch (err) {
    console.error("Error in updateLeadQueryDetails:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Query Status by ID
exports.updateQueryStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const updateFields = { status };

    if (status === "Call Later" && comment !== undefined) {
      updateFields.comment = comment;
    }

    const query = await Query.findByIdAndUpdate(
      req.params.queryId,
      updateFields,
      { new: true }
    );

    if (!query) return res.status(404).json({ message: "Query not found" });

    res.json({ success: true, data: query });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


