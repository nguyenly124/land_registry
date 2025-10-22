const jwt = require('jsonwebtoken');

// Lấy secret key từ biến môi trường.
// Đây là chìa khóa bí mật để giải mã token.
const JWT_SECRET = process.env.JWT_SECRET ;

module.exports = (req, res, next) => {
    // 1. Lấy token từ header của request
    const authHeader = req.header('Authorization');

    // Kiểm tra xem header 'Authorization' có tồn tại không
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token, ủy quyền bị từ chối.' });
    }
    
    // Định dạng token trong header thường là "Bearer <token>"
    // Chúng ta cần lấy phần token ra khỏi chuỗi
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Không có token, ủy quyền bị từ chối.' });
    }

    try {
        // 2. Giải mã token
        // jwt.verify() sẽ xác minh token bằng secret key
        // Nếu token không hợp lệ hoặc đã hết hạn, nó sẽ ném ra lỗi
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Gán thông tin người dùng đã giải mã vào đối tượng req
        // Các controller tiếp theo có thể truy cập thông tin này
        req.user = decoded;
        
        // 4. Chuyển sang middleware hoặc route handler tiếp theo
        next();
    } catch (err) {
        // 5. Xử lý lỗi nếu token không hợp lệ
        console.error('Lỗi xác thực token:', err.message);
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};