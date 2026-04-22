const KoiOrder = require('../../models/Koi/KoiOrder');
const KoiCustomer = require('../../models/Koi/KoiCustomer');
const KoiFoodInventory = require('../../models/Koi/KoiFoodInventory');
const StockTransaction = require('../../models/Koi/StockTransaction');

exports.createOrder = async (req, res) => {
    try {
        const order = await KoiOrder.create(req.body);
        
        // Update customer order history
        await KoiCustomer.findByIdAndUpdate(req.body.customer, {
            $push: { orderHistory: order._id },
            $inc: { purchaseFrequency: 1 }
        });

        // Reduce food stock directly
        if (req.body.foodItems && req.body.foodItems.length > 0) {
            for (const item of req.body.foodItems) {
                const foodItem = await KoiFoodInventory.findById(item.id);
                if (foodItem) {
                    foodItem.totalAvailableQuantity -= Number(item.quantity);
                    await foodItem.save();

                    // Log simplified transaction
                    await StockTransaction.create({
                        itemId: item.id,
                        type: 'Sale',
                        quantity: -Number(item.quantity),
                        remainingStockAfter: foodItem.totalAvailableQuantity,
                        performedBy: req.user ? req.user._id : null,
                        notes: `Order ID: ${order._id}`
                    });
                }
            }
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

        const orders = await KoiOrder.find()
            .populate('customer')
            .populate('enquiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await KoiOrder.countDocuments();

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

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await KoiOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
