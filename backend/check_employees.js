const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Employee = require('./models/Boss/Employee');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const count = await Employee.countDocuments({ status: 'Active' });
        const faceCount = await Employee.countDocuments({ "faceEncodings.0": { "$exists": true }, status: 'Active' });
        console.log(`Total Active Employees: ${count}`);
        console.log(`Employees with Face Data: ${faceCount}`);

        if (faceCount === 0) {
            const sample = await Employee.findOne();
            console.log('Sample employee:', sample ? JSON.stringify(sample, null, 2) : 'None');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
