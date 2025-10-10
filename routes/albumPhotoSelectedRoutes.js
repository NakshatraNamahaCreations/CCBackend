const express = require("express");
const router = express.Router();
const {
  createAlbumPhotoSelection,
  getLatestByAlbum
} = require("../Controllers/albumPhotoSelectedController");

// POST: Create new album photo selection
router.post("/create", createAlbumPhotoSelection);

// GET: Latest selected-photos by albumId (optionally filter by ?quotationId=...)
router.get("/quotation/:quotationId/latest-by-album", getLatestByAlbum);

module.exports = router;
