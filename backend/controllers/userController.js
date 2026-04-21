const User = require('../models/User');

// Get all users (Boss/Manager)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new user (Boss/Manager)
exports.createUser = async (req, res) => {
    const { name, email, password, role, branch, allocatedModules, employeeId } = req.body;
    try {
        // MD (BOSS) is the only one who can create a General Manager (MANAGER)
        if (role === 'MANAGER' && req.user.role !== 'BOSS') {
            return res.status(403).json({ message: 'Only the MD (BOSS) can create a General Manager' });
        }

        const user = new User({ name, email, password, role, branch, allocatedModules, employeeId });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email, role, branch, allocatedModules, employeeId } });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update user (Boss/Manager)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, branch, password, allocatedModules, employeeId } = req.body;
    
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Prevent non-BOSS from modifying a MANAGER or promoting someone to MANAGER
        if ((user.role === 'MANAGER' || role === 'MANAGER') && req.user.role !== 'BOSS') {
            return res.status(403).json({ message: 'Only the MD (BOSS) can modify or create a General Manager' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.branch = branch || user.branch;
        user.allocatedModules = allocatedModules || user.allocatedModules;
        user.employeeId = employeeId !== undefined ? employeeId : user.employeeId;
        
        if (password) {
            user.password = password;
        }
        
        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete user (Boss/Manager)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
