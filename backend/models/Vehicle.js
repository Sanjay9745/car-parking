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
        type: Number,
        required: true
    },
    color: {
        type: String
    },
    park: {
        type: Number,// 0 - Not In Parking,5- Parking,10 - Parked
        default: 0
    },
    entry: {
        type: Date
    },
    exit: {
        type: Date
    },
    logs:[{
        entry: {
            type: Date,
            required: true
        },
        exit: {
            type: Date
        }
    }]
});


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;