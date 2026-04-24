const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        hsnSac: String
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
    isAdvancePaid: { type: Boolean, default: false },
    taxPhase: {
        type: String,
        enum: ['Inside TN', 'Outside TN'],
        default: 'Inside TN'
    },
    transportCharges: { type: Number, default: 0 },
    salesPerson: String,
    companyInfo: {
        name: { type: String, default: 'PVR AQUACULTURE' },
        address: { type: String, default: '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104' },
        contact: { type: String, default: '+91 9600124725, +91 9003424998' },
        gstin: { type: String, default: '33CQRPA2571H1ZW' }
    },
    billingInfo: {
        name: String,
        address: String,
        phone: String,
        gstNo: String
    },
    bankDetails: {
        accountNo: { type: String, default: '7037881010' },
        ifscCode: { type: String, default: 'IDIB000N140' },
        bankName: { type: String, default: 'INDIAN BANK' },
        branch: { type: String, default: 'NATHAMPANNAI' }
    }
}, { timestamps: true });

orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
