const jwt = require('jsonwebtoken');
const User = require('../modules/User/User');

const Authenticate = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token provided" });


            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(404).json({ success: false, message: "The user belonging to this token no longer exists." });
            }

            req.user = user;

            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, token failed or is invalid." });
        }
    } else {
        return res.status(401).json({ success: false, message: "Not authorized, no token was found in the header." });
    }
};


/**
 * Middleware to check if the logged-in user has one of the required roles.
 * @param  {...string} roles - A list of roles that are allowed to access the route.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `Forbidden: You do not have permission to perform this action. Requires one of these roles: ${roles.join(', ')}` });
        }
        next();
    };
};


module.exports = { Authenticate, authorize };