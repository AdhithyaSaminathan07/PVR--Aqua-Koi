const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    address: { type: String },
    department: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
