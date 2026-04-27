const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true }, // e.g., 'AQUA_MANAGER', 'STAFF'
    modules: { type: [String], default: [] },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
