const express = require('express');
const controller = require('./vehicle'); // Adjust the path as necessary
const upload = require('../../middlewares/imageUpload'); // Adjust the path as necessary
const userAuth = require('../../middlewares/userAuth');
const adminAuth = require('../../middlewares/adminAuth');

const router = express.Router();
router.post('/', upload, controller.createVehicle);
router.get('/', controller.getAllVehicles);
router.post('/upload',adminAuth,upload, controller.uploadLPlate);
router.post('/entry',adminAuth, controller.addEntry);
router.post('/exit',adminAuth, controller.addExit)

// users
router.post('/user',userAuth, controller.addVehicleToUser);
router.get('/user',userAuth, controller.getUserVehicles);
router.delete('/user/:id',userAuth, controller.deleteUserVehicle);

router.post('/slot/:id', controller.addVehicleToSlot);

router.get('/:id', controller.getVehicleById);
router.put('/:id', upload, controller.updateVehicleById);
router.delete('/:id', controller.deleteVehicleById);




module.exports = router;