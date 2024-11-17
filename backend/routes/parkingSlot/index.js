const express = require('express');

const router = express.Router();
const controller = require('./parkingSlot');
const adminAuth = require('../../middlewares/adminAuth');
const anyLoginAuth = require('../../middlewares/anyLoginAuth');

router.post('/',adminAuth, controller.addParkingSlot);
router.get('/',anyLoginAuth, controller.getParkingSlots);
router.post('/changeStatus/:id',adminAuth, controller.changeStatus);
router.get('/:id',anyLoginAuth, controller.getParkingSlotById);
router.put('/:id',adminAuth, controller.updateParkingSlotById);
router.delete('/:id',adminAuth, controller.deleteParkingSlotById);

module.exports = router;