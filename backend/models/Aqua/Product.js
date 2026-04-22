const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    lowStockThreshold: { type: Number, default: 5 },
    unit: { type: String, default: 'pcs' },
    hsnSac: { type: String, default: '' },
    specifications: { type: [specificationSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
