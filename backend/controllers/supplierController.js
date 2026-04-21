const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
