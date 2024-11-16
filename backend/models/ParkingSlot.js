const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: Number,
        required: true
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    slotType: {
        type: String, // A, B, C, D
        required: true
    }
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = ParkingSlot;