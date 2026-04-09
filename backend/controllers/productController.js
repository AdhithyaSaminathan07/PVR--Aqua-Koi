const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        // Synchronize minStock and lowStockThreshold if one is missing
        if (productData.minStock && !productData.lowStockThreshold) {
            productData.lowStockThreshold = productData.minStock;
        } else if (!productData.minStock && productData.lowStockThreshold) {
            productData.minStock = productData.lowStockThreshold;
        }

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productData = req.body;
        // Synchronize minStock and lowStockThreshold if one is missing
        if (productData.minStock && !productData.lowStockThreshold) {
            productData.lowStockThreshold = productData.minStock;
        } else if (!productData.minStock && productData.lowStockThreshold) {
            productData.minStock = productData.lowStockThreshold;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete product with ID: ${id}`);
        
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            console.log(`Product with ID ${id} not found`);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`Product with ID ${id} deleted successfully`);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(`Error deleting product: ${err.message}`);
        res.status(400).json({ message: err.message });
    }
};

exports.stockUpdate = async (req, res) => {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'IN' or 'OUT'
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (type === 'IN') {
            product.stock += quantity;
        } else {
            product.stock -= quantity;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
