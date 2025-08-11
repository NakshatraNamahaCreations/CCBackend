// routes/package.routes.js

// const express = require('express');
// const router = express.Router();
// const packageController = require('../Controllers/package.controller');

// router.post('/packages', packageController.createPackage);
// router.get('/packages', packageController.getPackages);

// module.exports = router;




const express = require("express");
const router = express.Router();
const packageController = require("../Controllers/package.controller");


// Routes for Package CRUD operations
router.post("/create", packageController.createPackage); 
router.get("/", packageController.getPackages);          
router.get("/:id", packageController.getPackageById);    
router.put("/:id", packageController.updatePackage);     
router.delete("/:id", packageController.deletePackage);  

module.exports = router;
