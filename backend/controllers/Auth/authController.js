const User = require('../../models/Boss/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email: rawEmail, password } = req.body;
    const email = rawEmail ? rawEmail.trim() : '';
    
    try {
        // 1. Check if login is BOSS / MD
        const bossEmail = (process.env.BOSS_EMAIL || "").toLowerCase().trim();
        const bossPasswordHash = (process.env.BOSS_PASSWORD || "").trim();
        
        if (email.toLowerCase() === bossEmail) {
            // ENFORCE BCRYPT ONLY for security
            if (!bossPasswordHash.startsWith('$2')) {
                console.warn('WARNING: BOSS_PASSWORD in .env is not hashed. Boss login disabled for security.');
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, bossPasswordHash);
            
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
                return res.status(401).json({ message: 'Invalid credentials' });
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
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

exports.register = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
