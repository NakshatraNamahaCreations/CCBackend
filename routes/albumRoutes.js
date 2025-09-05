const router = require("express").Router();
const ctrl = require("../Controllers/albumController");

router.get("/:quotationId/albums", ctrl.getAlbums);
router.get("/:quotationId/albums/:albumId", ctrl.getAlbumById);

router.post("/:quotationId/albums", ctrl.addAlbum);
router.put("/:quotationId/albums/:albumId", ctrl.updateAlbum);
router.delete("/:quotationId/albums/:albumId", ctrl.deleteAlbum);

module.exports = router;
