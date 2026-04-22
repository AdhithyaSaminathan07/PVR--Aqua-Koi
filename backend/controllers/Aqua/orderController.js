const Order = require('../../models/Aqua/Order');
const Enquiry = require('../../models/Aqua/Enquiry');
const Product = require('../../models/Aqua/Product');

exports.createEnquiry = async (req, res) => {
    try {
        const { customerId, items, status } = req.body;
        const enquiry = await Enquiry.create({ customerId, items, status });
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
        const { customerId, enquiryId, items, totalAmount, paidAmount, status, quotationFile, autoCADFiles, siteImages, invoiceId, isAdvancePaid, taxPhase, transportCharges, salesPerson, billingInfo } = req.body;
        const order = await Order.create({ customerId, enquiryId, items, totalAmount, paidAmount, status, quotationFile, autoCADFiles, siteImages, invoiceId, isAdvancePaid, taxPhase, transportCharges, salesPerson, billingInfo });
        
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .populate('customerId')
            .populate('items.productId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
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

