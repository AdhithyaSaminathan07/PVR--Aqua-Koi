const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: false },
    description: String,
    type: { type: String, enum: ['Installation', 'Service', 'Client Issue', 'Rescue/Repair'], required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    status: {
        type: String,
        enum: ['Travelling', 'Arrived', 'In Progress', 'Completed', 'Returned'],
        default: 'In Progress'
    },
    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }],
    materialsUsed: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
