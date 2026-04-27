const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    branch: { type: String, required: true, default: 'Aqua' },
    designation: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    address: { type: String },
    department: { type: String },
    rfid: { type: String, unique: true, sparse: true },
    faceEncodings: [[Number]],
    faceImages: [{
        data: Buffer,
        contentType: String,
        originalName: String
    }],
    lastAttendanceTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
