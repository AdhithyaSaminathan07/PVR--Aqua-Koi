const Invoice = require('../../models/Aqua/Invoice');
const Order = require('../../models/Aqua/Order');

exports.createInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        
        // If linked to an order, update order status
        if (req.body.order) {
            await Order.findByIdAndUpdate(req.body.order, { status: 'Completed' });
        }
        
        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('customer')
            .populate({
                path: 'order',
                populate: { path: 'items.productId' }
            })
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('customer')
            .populate({
                path: 'order',
                populate: { path: 'items.productId' }
            });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
