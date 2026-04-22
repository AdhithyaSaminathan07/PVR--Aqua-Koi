const Customer = require('../../models/Aqua/Customer');

exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const customers = await Customer.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Customer.countDocuments();

        res.json({
            customers,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, gstNo } = req.body;
        const customer = await Customer.create({ name, phone, email, address, gstNo });
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.json(customer);
    } catch (err) {
        res.status(404).json({ message: 'Customer not found' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, gstNo } = req.body;
        const customer = await Customer.findByIdAndUpdate(req.params.id, { name, phone, email, address, gstNo }, { new: true });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
