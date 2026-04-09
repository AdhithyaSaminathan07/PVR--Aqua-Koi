const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    details: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Quotation Sent', 'Converted', 'Closed'], default: 'Pending' },
    followUpDate: Date,
    followUpNotes: [String]
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
