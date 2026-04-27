const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    branch: {
        type: String,
        required: true,
        unique: true,
        default: 'Aqua'
    },
    locationRestriction: {
        isEnabled: {
            type: Boolean,
            default: false
        },
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        },
        radius: {
            type: Number,
            default: 150 // default radius in meters
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
