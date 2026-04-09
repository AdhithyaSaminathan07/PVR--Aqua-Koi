const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
