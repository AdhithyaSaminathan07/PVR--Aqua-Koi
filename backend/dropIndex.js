const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pvr_aqua';

async function dropIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const products = db.collection('products');
        
        // Attempt to drop the sku_1 index
        try {
            await products.dropIndex('sku_1');
            console.log('Index sku_1 dropped successfully');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('Index sku_1 not found, nothing to drop');
            } else {
                throw err;
            }
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

dropIndex();
