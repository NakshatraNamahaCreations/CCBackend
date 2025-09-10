// // models/DailyTask.js
// const mongoose = require("mongoose");

// const dailyTaskSchema = new mongoose.Schema(
//   {
//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//     },
//     vendorName: { type: String },
//     role: { type: String },
//     task: { type: String },
//     status: {
//       type: String,
//       enum: ["Created", "Pending", "Completed"],
//       default: "Created",
//     },
//     rescheduleDate: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// const DailyTask = mongoose.model("DailyTask", dailyTaskSchema);
// module.exports = DailyTask;



// models/DailyTask.js
const mongoose = require("mongoose");

const dailyTaskSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    vendorName: { type: String },
    role: { type: String },
    task: { type: String },
    status: {
      type: String,
      enum: ["Created", "Pending", "Completed"],
      default: "Created",
    },
    taskDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
  },
  { timestamps: true }
);

const DailyTask = mongoose.model("DailyTask", dailyTaskSchema);
module.exports = DailyTask;