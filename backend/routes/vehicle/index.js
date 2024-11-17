const express = require('express');
const controller = require('./vehicle'); // Adjust the path as necessary
const upload = require('../../middlewares/imageUpload'); // Adjust the path as necessary
const userAuth = require('../../middlewares/userAuth');
const adminAuth = require('../../middlewares/adminAuth');
const anyLoginAuth = require('../../middlewares/anyLoginAuth');

const router = express.Router();
router.post('/',anyLoginAuth, upload, controller.createVehicle);
router.get('/', controller.getAllVehicles);
router.post('/upload',adminAuth,upload, controller.uploadLPlate);
router.post('/entry',adminAuth, controller.addEntry);
router.post('/exit',adminAuth, controller.addExit)

// users
router.post('/user',userAuth, controller.addVehicleToUser);
router.get('/user',userAuth, controller.getUserVehicles);
router.delete('/user/:id',userAuth, controller.deleteUserVehicle);
router.put('/user/:id',userAuth, controller.updateUserVehicle);

router.post('/slot/:id', anyLoginAuth,controller.addVehicleToSlot);
router.post('/pay/:id',userAuth, controller.payForParking);
router.get('/:id',anyLoginAuth, controller.getVehicleById);
router.put('/:id',adminAuth, upload, controller.updateVehicleById);
router.delete('/:id',adminAuth, controller.deleteVehicleById);




module.exports = router;
