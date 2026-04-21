const mongoose = require('mongoose');

const koiFoodInventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: 'General' }, // Pellet, Flake, Growth, etc.
    totalAvailableQuantity: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    reorderLevel: { type: Number, default: 10 },
    unit: { type: String, enum: ['kg', 'grams', 'bags'], default: 'kg' },
    status: { type: String, enum: ['Active', 'Discontinued'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('KoiFoodInventory', koiFoodInventorySchema);
