// const mongoose = require("mongoose");

// const querySchema = new mongoose.Schema(
//   {
//     queryId: { type: String, unique: true, required: true },
//     eventDetails: [
//       {
//         category: { type: String, required: true },
//         eventStartDate: { type: Date, required: true },
//         eventEndDate: { type: Date, required: true },
//       },
//     ],
//     status: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// const Query = mongoose.models.Query || mongoose.model("Query", querySchema);

// module.exports = Query;

const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    queryId: { type: String, unique: true, required: true },
    eventDetails: [
      {
        category: { type: String, required: true },
        eventStartDate: { type: Date, required: true },
        eventEndDate: { type: Date, required: true },
      },
    ],
    status: { type: String },
    comment: { type: String },
    callRescheduledDate: { type: Date }, // ✅ new field added
  },
  { timestamps: true }
);

const Query = mongoose.models.Query || mongoose.model("Query", querySchema);
module.exports = Query;
