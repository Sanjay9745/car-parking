const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    lplate: {
        type: String,
        required: true,
        unique: true
    },
    make: {
        type: String
    },
    model: {
        type: String
    },
    year: {
        type: Number
    },
    color: {
        type: String
    },
    park: {
        type: Number,// 0 - Not In Parking,5- Parking,10 - Parked, 15 - Exit
        default: 0
    },
    entry: {
        type: Date
    },
    exit: {
        type: Date
    },
    paid: {
        type: Boolean,
        default: false
    },
    cost: {
        type: Number
    },
    logs:[]
});


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
