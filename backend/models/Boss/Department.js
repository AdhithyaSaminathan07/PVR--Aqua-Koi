const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    branch: { type: String, required: true, default: 'Aqua' },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
