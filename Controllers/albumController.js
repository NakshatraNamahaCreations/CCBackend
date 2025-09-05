const mongoose = require("mongoose");
const Quotation = require("../models/quotation.model");

// POST /api/quotations/:quotationId/albums
exports.addAlbum = async (req, res) => {
  try {
    const { quotationId } = req.params;
    if (!mongoose.isValidObjectId(quotationId)) {
      return res.status(400).json({ message: "Invalid quotationId" });
    }

    const q = await Quotation.findById(quotationId);
    if (!q) return res.status(404).json({ message: "Quotation not found" });

    // Push the new album
    q.albums.push(req.body);
    await q.save();

    const created = q.albums[q.albums.length - 1];
    return res
      .status(201)
      .json({ message: "Album added", album: created, quotation: q });
  } catch (err) {
    console.error("addAlbum error:", err);
    return res.status(500).json({ message: "Failed to add album" });
  }
};

// PUT /api/quotations/:quotationId/albums/:albumId
exports.updateAlbum = async (req, res) => {
  try {
    const { quotationId, albumId } = req.params;
    const update = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(quotationId) ||
      !mongoose.Types.ObjectId.isValid(albumId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    // Load quotation + existing album
    const q = await Quotation.findById(quotationId);
    if (!q)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });

    const album = q.albums.id(albumId);
    if (!album) {
      return res
        .status(404)
        .json({ success: false, message: "Album not found" });
    }

    // Previous values for delta calc
    const prevType = album.type;
    const prevFinalTotal =
      prevType === "addons" ? Number(album?.suggested?.finalTotal) || 0 : 0;

    // Apply only provided fields (don’t overwrite with undefined)
    const updatable = [
      "templateId",
      "boxTypeId",
      "qty",
      "unitPrice",
      "customizePerUnit",
      "extras",
      "suggested",
      "snapshot",
      "type",
    ];
    updatable.forEach((k) => {
      if (update[k] !== undefined) album[k] = update[k];
    });

    // New values for delta calc
    // const newType = album.type;
    // const newFinalTotal =
    //   newType === "addons" ? Number(album?.suggested?.finalTotal) || 0 : 0;

    // // Adjust quotation total by the delta
    // const delta = newFinalTotal - prevFinalTotal;
    // if (delta !== 0) {
    //   q.totalAmount = (Number(q.totalAmount) || 0) + delta;
    //   if (q.totalAmount < 0) q.totalAmount = 0; // safety guard
    // }

    await q.save();

    return res.json({
      success: true,
      album,
      quotation: q,
    });
  } catch (error) {
    console.error("Album update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating album",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// DELETE /api/quotations/:quotationId/albums/:albumId
exports.deleteAlbum = async (req, res) => {
  try {
    const { quotationId, albumId } = req.params;
    if (!mongoose.isValidObjectId(quotationId)) {
      return res.status(400).json({ message: "Invalid quotationId" });
    }

    const q = await Quotation.findById(quotationId);
    if (!q) return res.status(404).json({ message: "Quotation not found" });

    const album = q.albums.id(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    album.deleteOne();
    await q.save();

    return res.json({ message: "Album deleted", quotation: q });
  } catch (err) {
    console.error("deleteAlbum error:", err);
    return res.status(500).json({ message: "Failed to delete album" });
  }
};

// GET /api/quotations/:quotationId/albums
exports.getAlbums = async (req, res) => {
  try {
    const { quotationId } = req.params;
    if (!mongoose.isValidObjectId(quotationId)) {
      return res.status(400).json({ message: "Invalid quotationId" });
    }

    const q = await Quotation.findById(quotationId).select("albums");
    if (!q) return res.status(404).json({ message: "Quotation not found" });

    return res.json({ albums: q.albums });
  } catch (err) {
    console.error("getAlbums error:", err);
    return res.status(500).json({ message: "Failed to fetch albums" });
  }
};

// GET /api/quotations/:quotationId/albums/:albumId
exports.getAlbumById = async (req, res) => {
  try {
    const { quotationId, albumId } = req.params;
    if (!mongoose.isValidObjectId(quotationId)) {
      return res.status(400).json({ message: "Invalid quotationId" });
    }
    // albumId is a subdocument _id (ObjectId) in your schema
    if (!mongoose.isValidObjectId(albumId)) {
      return res.status(400).json({ message: "Invalid albumId" });
    }

    const q = await Quotation.findById(quotationId).select("albums");
    if (!q) return res.status(404).json({ message: "Quotation not found" });

    const album = q.albums.id(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    return res.json({ album });
  } catch (err) {
    console.error("getAlbumById error:", err);
    return res.status(500).json({ message: "Failed to fetch album" });
  }
};
