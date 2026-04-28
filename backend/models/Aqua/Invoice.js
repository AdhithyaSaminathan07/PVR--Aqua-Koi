const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    type: { type: String, default: 'Service' },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    taxPhase: { type: String, enum: ['Inside TN', 'Outside TN'], default: 'Inside TN' },
    transportCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    bankDetails: {
        accountNo: { type: String, default: '7037881010' },
        ifscCode: { type: String, default: 'IDIB000N140' },
        bankName: { type: String, default: 'INDIAN BANK' },
        branch: { type: String, default: 'NATHAMPANNAI' }
    },
    companyInfo: {
        name: { type: String, default: 'PVR AQUA SYSTEMS' },
        address: { type: String, default: '123 Aqua Street, Chennai, TN' },
        contact: { type: String, default: 'pvraqua@gmail.com' },
        gstin: { type: String, default: '33AAAAA0000A1Z5' }
    }
}, { timestamps: true });

module.exports = mongoose.model('AquaInvoice', invoiceSchema);
