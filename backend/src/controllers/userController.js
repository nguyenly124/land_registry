const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const userProfile = require('../models/userProfile');
const bcrypt = require('bcryptjs');
// Khởi tạo các models
const { Account, UserProfile } = initModels(sequelize);

// Hàm lấy thông tin hồ sơ của người dùng hiện tại
exports.getProfile = async (req, res) => {
  try {
    const accountId = req.user.id; // Lấy ID từ token đã được xác thực
    
    // Lấy thông tin cả Account và UserProfile
    const user = await Account.findByPk(accountId, {
      attributes: { 
        exclude: ['password', 'hashed_password', 'verification_code', 'reset_password_token'] 
      },
      include: [{
        model: UserProfile,
        as: 'UserProfiles', // Sử dụng alias đã định nghĩa trong init-models.js
        attributes: ['full_name', 'dob', 'address', 'phone', 'email', 'cccd', 'position', 'agency', 'staff_code']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng.' });
    };

    res.status(200).json({
      message: 'Lấy thông tin hồ sơ thành công.',
      data: user
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hồ sơ:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
  }
};

// Hàm lấy danh sách người dùng theo vai trò 
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params; 

    // Kiểm tra role có hợp lệ không
    if (role !== 'Người dân' && role !== 'Cán bộ') {
      return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    const users = await Account.findAll({
      where: { role: role },
      attributes: { 
        exclude: ['password', 'hashed_password', 'verification_code', 'reset_password_token'] 
      },
      include: [{
        model: UserProfile,
        as: 'UserProfiles',
        attributes: ['full_name', 'dob', 'address', 'phone', 'email', 'cccd', 'position', 'agency', 'staff_code']
      }]
    });

    res.status(200).json({
      message: `Lấy danh sách người dùng có vai trò '${role}' thành công.`,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
  }
};
// Chức năng Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const accountId = req.user.id; // Lấy account_id từ token đã được xác thực
        const updatedData = req.body;

        const profile = await UserProfile.findOne({ where: { account_id: accountId } });
        if (!profile) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng.' });
        }

        await profile.update(updatedData);
        res.status(200).json({ message: 'Cập nhật hồ sơ thành công.', profile });
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// đổi mật khẩu 
exports.changePassword = async (req, res) => {
    try {
        // Lấy ID người dùng từ token đã được xác thực
        const accountId = req.user.id;
        
        // Lấy mật khẩu cũ và mật khẩu mới từ body của request
        const { oldPassword, newPassword } = req.body;

        // 1. Tìm tài khoản người dùng trong database
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
        }

        // 2. So sánh mật khẩu cũ được gửi lên với mật khẩu đã lưu trong database
        const isMatch = await bcrypt.compare(oldPassword, account.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng.' });
        }
        const isSameAsOld = await bcrypt.compare(newPassword, account.password);
                if (isSameAsOld) {
                    return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
                }
        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Cập nhật mật khẩu mới vào database
        await account.update({ password: newHashedPassword });

        res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// Chức năng Tạo tài khoản Cán bộ 
exports.createStaffAccount = async (req, res) => {
  
    try {
        const { username, password, full_name, dob, address, phone, email, cccd, position, agency, staff_code } = req.body;
        
        const existingAccount = await Account.findOne({ where: { username: username } });
        if (existingAccount) {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }
        const existingStaffCode = await UserProfile.findOne({ where: { staff_code: staff_code } });
        if (existingStaffCode) {
            return res.status(409).json({ message: 'Mã cán bộ đã được sử dụng.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await sequelize.transaction(async (t) => {
            const newAccount = await Account.create({ username, password: hashedPassword, role: 'Cán bộ' }, { transaction: t });
            const newUserProfile = await UserProfile.create({
                account_id: newAccount.account_id, full_name, dob, address, phone, email, cccd, position, agency, staff_code
            }, { transaction: t });
            return { newAccount, newUserProfile };
        });

        res.status(201).json({ message: 'Tạo tài khoản cán bộ thành công.', account: result.newAccount, profile: result.newUserProfile });
    } catch (error) {
        console.error('Lỗi khi tạo tài khoản cán bộ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};