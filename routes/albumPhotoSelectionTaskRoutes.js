const express = require("express");
const router = express.Router();
const {
  createAlbumPhotoSelectionTask,
  getAlbumPhotoSelectionByAlbumId
} = require("../Controllers/albumPhotoSelectionTaskController");

// ✅ Create new album photo selection task
router.post("/create", createAlbumPhotoSelectionTask);

// ✅ Get tasks by album ID
router.get("/album/:albumId", getAlbumPhotoSelectionByAlbumId);

module.exports = router;
