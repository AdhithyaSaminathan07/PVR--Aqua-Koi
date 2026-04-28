const Order = require('../../models/Aqua/Order');
const Enquiry = require('../../models/Aqua/Enquiry');
const Product = require('../../models/Aqua/Product');
const Task = require('../../models/Staff/Task');

exports.createEnquiry = async (req, res) => {
    try {
        const { customerId, details, leadName, leadPhone, status } = req.body;
        const enquiry = await Enquiry.create({ 
            customerId, 
            details, 
            leadName, 
            leadPhone, 
            status 
        });
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
        let { customerId, enquiryId, items, totalAmount, ...rest } = req.body;

        // If no customerId but we have an enquiry, check if it's a lead
        if (!customerId && enquiryId) {
            const enquiry = await Enquiry.findById(enquiryId);
            if (enquiry && enquiry.leadName && enquiry.leadPhone) {
                // Create the customer first
                const Customer = require('../../models/Aqua/Customer');
                let customer = await Customer.findOne({ phone: enquiry.leadPhone });
                if (!customer) {
                    customer = await Customer.create({
                        name: enquiry.leadName,
                        phone: enquiry.leadPhone,
                        address: 'Field Conversion' // Default address
                    });
                }
                customerId = customer._id;
            }
        }

        if (!customerId) throw new Error('Customer ID is required to create an order');

        const order = await Order.create({ 
            customerId, 
            enquiryId, 
            items, 
            totalAmount, 
            ...rest 
        });
        
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
        if (enquiryId) {
            await Enquiry.findByIdAndUpdate(enquiryId, { status: 'Converted' });
        }

        // Automated Task Creation for Completed Orders
        if (order.status === 'Completed') {
            await Task.create({
                type: 'Installation',
                customerId: order.customerId,
                description: `Installation Task for Order #${order._id.toString().slice(-6)} - Auto Generated`,
                priority: 'Medium',
                status: 'Pending'
            });
        }
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
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

        // Automated Task Creation for Completed status
        if (status === 'Completed' && order.status !== 'Completed') {
            await Task.create({
                type: 'Installation',
                customerId: order.customerId,
                description: `Installation Task for Order #${order._id.toString().slice(-6)} - Auto Generated`,
                priority: 'Medium',
                status: 'Pending'
            });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
        res.json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        await Enquiry.findByIdAndDelete(id);
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.convertEnquiryToCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        if (enquiry.customerId) return res.status(400).json({ message: 'Lead already associated with a customer' });
        if (!enquiry.leadName || !enquiry.leadPhone) return res.status(400).json({ message: 'Lead details (name/phone) missing' });

        const Customer = require('../../models/Aqua/Customer');
        let customer = await Customer.findOne({ phone: enquiry.leadPhone });
        if (!customer) {
            customer = await Customer.create({
                name: enquiry.leadName,
                phone: enquiry.leadPhone,
                address: 'Converted from Enquiry'
            });
        }

        enquiry.customerId = customer._id;
        await enquiry.save();

        res.json({ message: 'Lead promoted to Customer successfully', customer, enquiry });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
