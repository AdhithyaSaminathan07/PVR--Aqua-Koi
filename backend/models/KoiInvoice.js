const mongoose = require('mongoose');

const koiInvoiceSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiOrder', required: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiCustomer', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Fish', 'Food'], required: true },
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
        accountNo: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        branch: { type: String }
    },
    companyInfo: {
        name: { type: String },
        address: { type: String },
        contact: { type: String },
        gstin: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('KoiInvoice', koiInvoiceSchema);
