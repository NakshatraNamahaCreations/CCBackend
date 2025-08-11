const express = require('express');
const router = express.Router();
const inventoryController = require('../Controllers/inventory.controller');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/inventory/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

router.post('/', upload.single('image'), inventoryController.createInventory);
router.get('/', inventoryController.getInventories);
router.get('/maintenance', inventoryController.getMaintenanceRecords);
router.get('/maintenance/:id', inventoryController.getMaintenanceById);
router.patch('/maintenance/:id', inventoryController.updateMaintenance);
router.post('/maintenance', inventoryController.createMaintenance);

module.exports = router;