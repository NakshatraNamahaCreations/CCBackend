// const mongoose = require("mongoose");

// const AssignedVendorSchema = new mongoose.Schema(
//   {
//     vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
//     vendorName: String,
//     category: String,
//   },
//   { _id: false } // <-- add this
// );

// const AssignedAssistantSchema = new mongoose.Schema(
//   {
//     assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
//     assistantName: String,
//     category: String,
//   },
//   { _id: false } // <-- add this
// );

// const ServiceSchema = new mongoose.Schema(
//   {
//     serviceName: String,
//     price: Number,
//     marginPrice: Number,
//     qty: { type: Number, default: 1, min: 1 },

//     // One entry per unit when qty > 1
//     assignedVendors: { type: [AssignedVendorSchema], default: [] },
//     assignedAssistants: { type: [AssignedAssistantSchema], default: [] },
//   },
//   { _id: true }
// );

// const PackageSchema = new mongoose.Schema(
//   {
//     categoryName: String,
//     packageType: { type: String, enum: ["Custom", "Preset"], default: "Custom" },
//     eventStartDate: String,
//     eventEndDate: String,
//     slot: String,
//     venueName: String,
//     venueAddress: String,
//     services: { type: [ServiceSchema], default: [] },
//   },
//   { _id: true }
// );

// const InstallmentSchema = new mongoose.Schema(
//   {
//     installmentNumber: Number,
//     dueDate: String,
//     paymentMode: String,
//     paymentAmount: Number,
//     paymentPercentage: Number,
//     status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
//   },
//   { _id: true }
// );

// const QuotationSchema = new mongoose.Schema(
//   {
//     leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
//     queryId: { type: mongoose.Schema.Types.ObjectId, ref: "Query", required: true },
//     quotationId: { type: String, required: true, unique: true },

//     quoteTitle: String,
//     quoteDescription: String,
//     invoiceNumber: { type: String, unique: true, sparse: true },

//     packages: { type: [PackageSchema], default: [] },
//     installments: { type: [InstallmentSchema], default: [] },

//     totalAmount: Number,
//     discountPercent: Number,
//     discountValue: Number,
//     gstApplied: Boolean,
//     gstValue: Number,
//     marginAmount: Number,

//     bookingStatus: { type: String, enum: ["NotBooked", "Booked"], default: "NotBooked" },
//     finalized: { type: Boolean, default: false },

//     clientInstructions: { type: [String], default: [] },
//   },
//   { timestamps: true }
// );

// // Keep vendor/assistant arrays within qty bounds
// QuotationSchema.pre("save", function (next) {
//   this.packages?.forEach((pkg) => {
//     pkg.services?.forEach((s) => {
//       const desired = Math.max(1, s.qty || 1);

//       if (!Array.isArray(s.assignedVendors)) s.assignedVendors = [];
//       while (s.assignedVendors.length < desired) s.assignedVendors.push({}); // {} not null

//       if (!Array.isArray(s.assignedAssistants)) s.assignedAssistants = [];
//       while (s.assignedAssistants.length < desired) s.assignedAssistants.push({}); // {} not null

//       if (s.assignedVendors.length > desired) s.assignedVendors = s.assignedVendors.slice(0, desired);
//       if (s.assignedAssistants.length > desired) s.assignedAssistants = s.assignedAssistants.slice(0, desired);
//     });
//   });
//   next();
// });

// module.exports = mongoose.model("Quotation", QuotationSchema);

// models/Quotation.js
const mongoose = require("mongoose");

/* ---------- Albums ---------- */

const SheetTypeSchema = new mongoose.Schema(
  { id: String, label: String, price: Number },
  { _id: false }
);

// Map<string, number> for sheet quantities
const SheetQtyMap = { type: Map, of: Number, default: undefined };

const AlbumExtrasSchema = new mongoose.Schema(
  {
    // one of these will be used (based on customizePerUnit)
    shared: SheetQtyMap, // applies to every unit
    perUnit: [{ type: Map, of: Number }], // length must equal qty if customizePerUnit=true
  },
  { _id: false }
);

const AlbumSuggestedSchema = new mongoose.Schema(
  {
    // album-only price (no box) per unit at time of save
    albumOnlyPerUnit: [{ type: Number, min: 0 }],
    // box surcharge per unit at time of save
    boxPerUnit: { type: Number, default: 0, min: 0 },
    // final per-unit (album + extras + box)
    finalPerUnit: [{ type: Number, min: 0 }],
    // final total (all units)
    finalTotal: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AlbumSnapshotSchema = new mongoose.Schema(
  {
    templateLabel: String,
    baseSheets: Number,
    basePhotos: Number,
    boxLabel: String,
    // optional but useful if box prices change later
    boxSurchargeAtSave: { type: Number, default: 0 },
    sheetTypes: [SheetTypeSchema],
  },
  { _id: false }
);

const AlbumSchema = new mongoose.Schema(
  {
    // optional: keep client-side id to map UI rows if you like
    clientId: String,

    templateId: { type: String, required: true },
    boxTypeId: { type: String, required: true },

    qty: { type: Number, default: 1, min: 1 },

    // IMPORTANT: album-only unit price (no box)
    unitPrice: { type: Number, required: true, min: 0 },

    // legacy field you had; keep for display if you want
    extraSheets: { type: Number, default: 0, min: 0 },

    customizePerUnit: { type: Boolean, default: false },

    extras: { type: AlbumExtrasSchema, default: {} },

    suggested: { type: AlbumSuggestedSchema, default: {} },

    snapshot: { type: AlbumSnapshotSchema, default: {} },

    notes: String,
    type: String,
  },
  { _id: true, timestamps: true }
);

// Validate: when customizePerUnit=true, extras.perUnit length must match qty
AlbumSchema.pre("validate", function (next) {
  if (this.customizePerUnit) {
    const arr = Array.isArray(this.extras?.perUnit) ? this.extras.perUnit : [];
    if (arr.length !== this.qty) {
      return next(
        new Error(
          "extras.perUnit length must equal qty when customizePerUnit is true"
        )
      );
    }
  }
  next();
});

// Convenience: compute total if suggested.finalTotal missing
AlbumSchema.methods.computeTotal = function () {
  if (typeof this.suggested?.finalTotal === "number")
    return this.suggested.finalTotal;

  // best effort fallback (album only + box; extras unknown here)
  const box = Number(this.suggested?.boxPerUnit || 0);
  const qty = this.qty || 1;
  if (this.customizePerUnit && Array.isArray(this.suggested?.finalPerUnit)) {
    return this.suggested.finalPerUnit.reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );
  }
  return (Number(this.unitPrice || 0) + box) * qty;
};

// Optional: virtual to show approx extra sheets per unit (shared or avg of per-unit)
AlbumSchema.virtual("extraSheetsPerUnit").get(function () {
  if (this.customizePerUnit && Array.isArray(this.extras?.perUnit)) {
    const sums = this.extras.perUnit.map((m) =>
      Array.from((m || new Map()).values()).reduce(
        (a, b) => a + (Number(b) || 0),
        0
      )
    );
    return Math.round(sums.reduce((a, b) => a + b, 0) / (sums.length || 1));
  }
  if (this.extras?.shared instanceof Map) {
    return Array.from(this.extras.shared.values()).reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );
  }
  // legacy
  return Number(this.extraSheets || 0);
});

/* ---------- Vendors / Services / Packages (your original, unchanged) ---------- */

const AssignedVendorSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: String,
    category: String,
    salary: Number,
    paymentStatus: { type: String, enum: ["Completed", "Pending"], default: "Pending" },
    paymentDate: { type: Date},
    paymentMode: { type: String},
  },
  { _id: false }
);

const AssignedAssistantSchema = new mongoose.Schema(
  {
    assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    assistantName: String,
    category: String,

  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: String,
    price: Number,
    marginPrice: Number,
    qty: { type: Number, default: 1, min: 1 },
    assignedVendors: { type: [AssignedVendorSchema], default: [] },
    assignedAssistants: { type: [AssignedAssistantSchema], default: [] },
  },
  { _id: true }
);

const PackageSchema = new mongoose.Schema(
  {
    categoryName: String,
    packageType: {
      type: String,
      enum: ["Custom", "Preset"],
      default: "Custom",
    },
    eventStartDate: String,
    eventEndDate: String,
    slot: String,
    venueName: String,
    venueAddress: String,
    services: { type: [ServiceSchema], default: [] },
  },
  { _id: true }
);

const InstallmentSchema = new mongoose.Schema(
  {
    installmentNumber: Number,
    dueDate: String,
    paymentMode: String,
    paymentAmount: Number, // planned amount (from % when created)
    paymentPercentage: Number,
    paidAmount: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Partial Paid", "Completed"],
      default: "Pending",
    },
    // NEW: store multiple account holders with their paid amounts
    accountHolders: [
      {
        name: String,
      },
    ],
  },
  { _id: true }
);

const FollowUpHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Payment Received"],
      default: "Pending",
    },
    notes: String,
    contactedBy: String,
  },
  { _id: true }
);

const QuotationSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },
    quotationId: { type: String, required: true, unique: true },

    quoteTitle: String,
    quoteDescription: String,
    invoiceNumber: { type: String, unique: true, sparse: true },
    quoteNote: String,
    packages: { type: [PackageSchema], default: [] },
    installments: { type: [InstallmentSchema], default: [] },
    totalPackageAmt: Number,
    totalAlbumAmount: Number,
    totalAmount: Number,
    oldAmount: {
      type: Number,
      default: 0,
    },
    discountPercent: Number,
    discountValue: Number,
    gstApplied: Boolean,
    gstValue: Number,
    marginAmount: Number,

    bookingStatus: {
      type: String,
      enum: ["NotBooked", "Booked", "Completed"],
      default: "NotBooked",
    },
    finalized: { type: Boolean, default: false },

    clientInstructions: { type: [String], default: [] },

    // ✅ albums embedded here
    albums: { type: [AlbumSchema], default: [] },

    followUpHistory: { type: [FollowUpHistorySchema], default: [] },
  },
  { timestamps: true }
);

// Keep vendor/assistant arrays within qty bounds
QuotationSchema.pre("save", function (next) {
  this.packages?.forEach((pkg) => {
    pkg.services?.forEach((s) => {
      const desired = Math.max(1, s.qty || 1);
      if (!Array.isArray(s.assignedVendors)) s.assignedVendors = [];
      while (s.assignedVendors.length < desired) s.assignedVendors.push({});
      if (!Array.isArray(s.assignedAssistants)) s.assignedAssistants = [];
      while (s.assignedAssistants.length < desired)
        s.assignedAssistants.push({});
      if (s.assignedVendors.length > desired)
        s.assignedVendors = s.assignedVendors.slice(0, desired);
      if (s.assignedAssistants.length > desired)
        s.assignedAssistants = s.assignedAssistants.slice(0, desired);
    });
  });
  next();
});

module.exports = mongoose.model("Quotation", QuotationSchema);
