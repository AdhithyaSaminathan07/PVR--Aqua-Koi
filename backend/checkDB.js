const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pvr_aqua';

async function checkIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const products = db.collection('products');
        
        const indexes = await products.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));
        
        const sample = await products.findOne({});
        console.log('Sample Product:', JSON.stringify(sample, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkIndexes();
