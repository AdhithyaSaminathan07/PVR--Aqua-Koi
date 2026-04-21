const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiFoodInventory', required: true },
    type: { 
        type: String, 
        enum: ['Purchase', 'Sale', 'Damage', 'Adjustment', 'Return'], 
        required: true 
    },
    quantity: { type: Number, required: true }, // Positive for In, Negative for Out
    remainingStockAfter: { type: Number, required: true }, // Snapshot of totalAvailableQuantity after transaction
    transactionDate: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
