const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    vendorName: { type: String },
    role: { type: String },
    task: { type: String }

}, { timestamps: true });

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);
module.exports = DailyTask;
