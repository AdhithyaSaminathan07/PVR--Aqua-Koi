const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Quotation', 'In Production', 'Ready for Dispatch', 'Dispatched', 'Completed'],
        default: 'Quotation'
    },
    quotationFile: String, // URL to design/quotation
    autoCADFiles: [String],
    siteImages: [String],
    invoiceId: String,
    isAdvancePaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
