const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number,
        googleMapsLink: String
    },
    lastServiceDate: Date,
    nextServiceDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
