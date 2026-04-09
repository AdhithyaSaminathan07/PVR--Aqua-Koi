const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    installationDate: Date,
    serviceExpiryDate: Date, // 60 days after installation
    logs: [{
        visitDate: Date,
        notes: String,
        visitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        replacedItems: [{

            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number
        }]
    }],
    componentLifecycles: [{
        componentName: String,
        lifespanYears: Number,
        lastReplacementDate: Date,
        nextReplacementDate: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
