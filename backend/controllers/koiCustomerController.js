const KoiCustomer = require('../models/KoiCustomer');

exports.getCustomers = async (req, res) => {
    try {
        const customers = await KoiCustomer.find().sort({ name: 1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await KoiCustomer.findById(req.params.id).populate('orderHistory');
        res.json(customer);
    } catch (err) {
        res.status(404).json({ message: 'Customer not found' });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = await KoiCustomer.create(req.body);
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await KoiCustomer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await KoiCustomer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
