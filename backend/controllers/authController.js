const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail ? rawEmail.trim() : '';
    
    try {
        // 1. Check if login is BOSS / MD
        const bossEmail = (process.env.BOSS_EMAIL || "").toLowerCase().trim();
        const bossPasswordHash = (process.env.BOSS_PASSWORD || "").trim();
        
        if (email.toLowerCase() === bossEmail) {
            let isMatch = false;
            if (bossPasswordHash.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, bossPasswordHash);
            } else {
                isMatch = (password === bossPasswordHash);
            }
            
            if (isMatch) {
                const token = jwt.sign(
                    { id: 'boss', role: 'BOSS' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({
                    token,
                    role: 'BOSS',
                    message: 'Boss login successful'
                });
            } else {
                return res.status(401).json({ message: 'Invalid Boss credentials' });
            }
        }

        // 2. Fallback to normal users in database
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role, employeeId: user.employeeId }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });
        res.json({
            token,
            role: user.role,
            user: { name: user.name, email: user.email, role: user.role, allocatedModules: user.allocatedModules || [], employeeId: user.employeeId }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
