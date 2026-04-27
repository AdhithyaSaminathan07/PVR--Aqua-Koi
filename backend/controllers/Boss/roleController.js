const Role = require('../../models/Boss/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Boss
exports.getRoles = async (req, res) => {
    try {
        console.log('Fetching roles...');
        let roles = await Role.find();
        
        // Seed critical roles if none exist or if specific ones are missing
        if (roles.length === 0) {
            console.log('No roles found, seeding defaults...');
            const defaultRoles = [
                {
                    name: 'Boss',
                    key: 'BOSS',
                    modules: [
                        'Aqua:Dashboard', 'Aqua:Attendance', 'Aqua:Employees', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Invoices',
                        'Koi:Dashboard', 'Koi:Attendance', 'Koi:Employees', 'Koi:Enquiries', 'Koi:Sales & Billing', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers', 'Koi:Invoices'
                    ],
                    description: 'Full System Access'
                },
                {
                    name: 'General Manager',
                    key: 'MANAGER',
                    modules: [
                        'Aqua:Dashboard', 'Aqua:Attendance', 'Aqua:Employees', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Invoices',
                        'Koi:Dashboard', 'Koi:Attendance', 'Koi:Employees', 'Koi:Enquiries', 'Koi:Sales & Billing', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers', 'Koi:Invoices'
                    ],
                    description: 'Full System Access'
                },
                {
                    name: 'General Staff',
                    key: 'GENERAL_STAFF',
                    modules: ['Aqua:Dashboard', 'Aqua:Tasks', 'Aqua:Complaints', 'Aqua:Orders', 'Koi:Enquiries', 'Staff:Portal'],
                    description: 'Field staff for tasks and complaint handling'
                },
                {
                    name: 'General Employee',
                    key: 'GENERAL_EMPLOYEE',
                    modules: ['Aqua:Dashboard', 'Aqua:Tasks', 'Aqua:Complaints', 'Aqua:Orders', 'Koi:Enquiries', 'Staff:Portal'],
                    description: 'Support staff for operations'
                }
            ];
            
            await Role.insertMany(defaultRoles);
            roles = await Role.find();
        } else {
            // Check for missing critical staff roles
            const hasGeneralStaff = roles.some(r => r.key === 'GENERAL_STAFF');
            const hasGeneralEmployee = roles.some(r => r.key === 'GENERAL_EMPLOYEE');
            
            if (!hasGeneralStaff || !hasGeneralEmployee) {
                const missingRoles = [];
                if (!hasGeneralStaff) missingRoles.push({
                    name: 'General Staff',
                    key: 'GENERAL_STAFF',
                    modules: ['Aqua:Dashboard', 'Aqua:Tasks', 'Aqua:Complaints', 'Staff:Portal'],
                    description: 'Field staff for tasks and complaint handling'
                });
                if (!hasGeneralEmployee) missingRoles.push({
                    name: 'General Employee',
                    key: 'GENERAL_EMPLOYEE',
                    modules: ['Aqua:Dashboard', 'Aqua:Tasks', 'Aqua:Complaints', 'Staff:Portal'],
                    description: 'Support staff for operations'
                });
                
                await Role.insertMany(missingRoles);
                roles = await Role.find();
            }
        }

        console.log(`Found ${roles.length} roles`);
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Boss
exports.createRole = async (req, res) => {
    try {
        let { name, key, modules, description } = req.body;

        if (!key && name) {
            key = name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        }

        const roleExists = await Role.findOne({ $or: [{ name }, { key }] });

        if (roleExists) {
            return res.status(400).json({ message: 'Role with this name or key already exists' });
        }

        const role = await Role.create({
            name,
            key,
            modules,
            description
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Boss
exports.updateRole = async (req, res) => {
    try {
        const { name, key, modules, description } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.name = name || role.name;
        role.key = key ? key.toUpperCase().replace(/\s+/g, '_') : role.key;
        role.modules = modules || role.modules;
        role.description = description || role.description;

        const updatedRole = await role.save();
        res.status(200).json(updatedRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Boss
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await role.deleteOne();
        res.status(200).json({ message: 'Role removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
