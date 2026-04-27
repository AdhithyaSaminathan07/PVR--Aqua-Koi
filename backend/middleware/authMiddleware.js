const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = (req.user.role || '').toUpperCase().trim();
        const normalizedUserRole = userRole.replace(/[\s_-]/g, '');
        
        const normalizedAllowedRoles = roles.map(r => r.toUpperCase().trim().replace(/[\s_-]/g, ''));

        // MD (BOSS) and General Manager (MANAGER) have system-wide access
        if (normalizedUserRole === 'BOSS' || normalizedUserRole === 'MANAGER' || normalizedAllowedRoles.includes(normalizedUserRole)) {
            return next();
        }
        return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    };
};
