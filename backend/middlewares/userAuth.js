const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const userAuth = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        if (decoded.role != 1) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = userAuth;