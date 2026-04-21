const KoiFoodInventory = require('../models/KoiFoodInventory');
const StockTransaction = require('../models/StockTransaction');

// Get all food items with total quantity
exports.getStock = async (req, res) => {
    try {
        const stock = await KoiFoodInventory.find().sort({ itemName: 1 });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new food item (Master Entry)
exports.createItem = async (req, res) => {
    try {
        const item = await KoiFoodInventory.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update food item master record
exports.updateItem = async (req, res) => {
    try {
        const item = await KoiFoodInventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Add stock (Direct Adjustment)
exports.purchaseStock = async (req, res) => {
    try {
        const { itemId, quantity, notes } = req.body;
        const item = await KoiFoodInventory.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        item.totalAvailableQuantity += Number(quantity);
        await item.save();

        const transaction = await StockTransaction.create({
            itemId,
            type: 'Purchase',
            quantity: Number(quantity),
            remainingStockAfter: item.totalAvailableQuantity,
            performedBy: req.user ? req.user._id : null,
            notes: notes || `Restock of ${quantity} units`
        });

        res.status(201).json({ item, transaction });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Reduce stock (Direct Adjustment)
exports.reduceStock = async (req, res) => {
    try {
        const { itemId, quantity, type, notes } = req.body;
        const item = await KoiFoodInventory.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.totalAvailableQuantity < quantity) {
            return res.status(400).json({ message: `Insufficient stock. Have ${item.totalAvailableQuantity}, want ${quantity}` });
        }
            
        item.totalAvailableQuantity -= Number(quantity);
        await item.save();

        const transaction = await StockTransaction.create({
            itemId,
            type: type || 'Adjustment',
            quantity: -Number(quantity),
            remainingStockAfter: item.totalAvailableQuantity,
            performedBy: req.user ? req.user._id : null,
            notes: notes || `${type || 'Adjustment'} of ${quantity} units`
        });

        res.json({ item, transaction });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Set absolute stock
exports.setStock = async (req, res) => {
    try {
        const { itemId, quantity, notes } = req.body;
        const item = await KoiFoodInventory.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const diff = Number(quantity) - item.totalAvailableQuantity;
        item.totalAvailableQuantity = Number(quantity);
        await item.save();

        const transaction = await StockTransaction.create({
            itemId,
            type: 'Adjustment',
            quantity: diff,
            remainingStockAfter: item.totalAvailableQuantity,
            performedBy: req.user ? req.user._id : null,
            notes: notes || `Direct adjustment to ${quantity}`
        });

        res.json({ item, transaction });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get low stock items
exports.getLowStock = async (req, res) => {
    try {
        const lowStock = await KoiFoodInventory.find({
            $expr: { $lte: ["$totalAvailableQuantity", "$lowStockThreshold"] }
        });
        res.json(lowStock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const history = await StockTransaction.find({ itemId: req.params.itemId })
            .populate('performedBy', 'username')
            .sort({ transactionDate: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Simplified Analytics (Total Stock Count)
exports.getAnalytics = async (req, res) => {
    try {
        const stock = await KoiFoodInventory.find();
        const totalItems = stock.length;
        const lowStockCount = stock.filter(item => item.totalAvailableQuantity <= item.lowStockThreshold).length;
        
        res.json({ totalItems, lowStockCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete food item master record
exports.deleteItem = async (req, res) => {
    try {
        await KoiFoodInventory.findByIdAndDelete(req.params.id);
        await StockTransaction.deleteMany({ itemId: req.params.id });
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
