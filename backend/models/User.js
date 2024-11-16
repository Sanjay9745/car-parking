const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');
// Import the required modules

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: Number,// 1: user, 2: admin
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    vehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    }]
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;