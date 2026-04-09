const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    lowStockThreshold: { type: Number, default: 5 },

    unit: { type: String, default: 'pcs' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
