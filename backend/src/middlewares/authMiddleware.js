const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ;

module.exports = (req, res, next) => {
    // 1. Lấy token từ header của request
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token, ủy quyền bị từ chối.' });
    }
    
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Không có token, ủy quyền bị từ chối.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Lỗi xác thực token:', err.message);
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};