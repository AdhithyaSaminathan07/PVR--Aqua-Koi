const Order = require('../models/Order');
const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');

exports.createEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.create(req.body);
        res.status(201).json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().populate('customerId');
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createOrderFromQuotation = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        
        // Stock deduction for direct orders
        if (order.status === 'Dispatched' || order.status === 'Completed') {
            for (const item of order.items) {
                if (item.productId) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }
        }

        // Update enquiry status if exists
        if (req.body.enquiryId) {
            await Enquiry.findByIdAndUpdate(req.body.enquiryId, { status: 'Converted' });
        }
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('customerId').populate('items.productId');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const order = await Order.findById(id);
        order.paidAmount = Number(amount);
        
        if (order.paidAmount >= order.totalAmount) {
            order.status = 'Ready for Dispatch';
            order.isAdvancePaid = true; // Fully paid is also advance paid
        } else if (order.paidAmount >= order.totalAmount * 0.3) { // 30% advance
            order.isAdvancePaid = true;
            if (order.status === 'Quotation') order.status = 'In Production';
        }
        
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findById(id);

        // Stock deduction logic on Dispatch or Completion
        if ((status === 'Dispatched' || status === 'Completed') && order.status !== 'Dispatched' && order.status !== 'Completed') {
            for (const item of order.items) {
                if (item.productId) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

