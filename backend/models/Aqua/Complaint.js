const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Water Quality', 'Equipment', 'Service', 'Billing', 'Other'], 
        default: 'Other' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Urgent'], 
        default: 'Medium' 
    },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true });

complaintSchema.index({ customerId: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
