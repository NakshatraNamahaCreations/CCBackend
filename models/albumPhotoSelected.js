const mongoose = require("mongoose");

const AlbumPhotoSelectedSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    albumDetails: {
      templateLabel: { type: String, required: true },
      baseSheets: { type: Number, required: true },
      basePhotos: { type: Number, required: true },
    },
    selectedPhotos: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlbumPhotoSelected", AlbumPhotoSelectedSchema);
