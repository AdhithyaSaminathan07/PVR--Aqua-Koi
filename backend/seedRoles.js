const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Boss/Role');

dotenv.config();

const roles = [
    {
        name: 'General Manager (GM)',
        key: 'MANAGER',
        modules: [
            'Aqua:Dashboard', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Enquiry & Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Employees', 'Aqua:Invoices',
            'Koi:Dashboard', 'Koi:Enquiries', 'Koi:Orders', 'Koi:Invoices', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers'
        ],
        description: 'Full access to both Aqua and Koi modules'
    },
    {
        name: 'Aqua Branch Manager',
        key: 'admin',
        modules: [
            'Aqua:Dashboard', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Enquiry & Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Employees', 'Aqua:Invoices'
        ],
        description: 'Full access to Aqua modules'
    },
    {
        name: 'Koi Branch Manager',
        key: 'KOI_MANAGER',
        modules: [
            'Koi:Dashboard', 'Koi:Enquiries', 'Koi:Orders', 'Koi:Invoices', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers'
        ],
        description: 'Full access to Koi modules'
    },
    {
        name: 'Generic Branch Manager',
        key: 'BRANCH_MANAGER',
        modules: [
            'Aqua:Dashboard', 'Aqua:Customers', 'Aqua:Inventory', 'Koi:Dashboard', 'Koi:Inventory', 'Koi:Customers'
        ],
        description: 'Partial access to both branches'
    },
    {
        name: 'General Staff',
        key: 'STAFF',
        modules: [
            'Aqua:Tasks', 'Aqua:Customers', 'Koi:Customers'
        ],
        description: 'Basic access to tasks and customers'
    }
];

const seedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pvr_aqua');
        console.log('MongoDB connected for seeding...');

        for (const roleData of roles) {
            const existingRole = await Role.findOne({ key: roleData.key });
            if (!existingRole) {
                await Role.create(roleData);
                console.log(`Created role: ${roleData.name}`);
            } else {
                console.log(`Role ${roleData.name} already exists, skipping...`);
            }
        }

        console.log('Seeding completed.');
        process.exit();
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
