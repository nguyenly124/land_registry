const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { Op } = require("sequelize");
const crypto = require('crypto');
// Khởi tạo models
const { Account, UserProfile } = initModels(sequelize);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ;

// Chức năng Đăng ký tài khoản (Người dân)
exports.register = async (req, res) => {
    try {
        const { username, password, full_name, dob, address, phone, email, cccd } = req.body;
        
        // 1. Kiểm tra tài khoản đã tồn tại theo username, email, phone hoặc cccd
        const existingAccount = await Account.findOne({ where: { username } });
        const existingProfile = await UserProfile.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { phone },
                    { cccd }
                ]
            }
        });

        if (existingAccount) {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }
        if (existingProfile) {
            return res.status(409).json({ message: 'Email, số điện thoại hoặc CCCD đã được sử dụng.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const defaultRole = 'Người dân';
        const result = await sequelize.transaction(async (t) => {
            const newAccount = await Account.create({ username, password: hashedPassword, role:defaultRole }, { transaction: t });
            const newUserProfile = await UserProfile.create({
                account_id: newAccount.account_id, full_name, dob, address, phone, email, cccd
            }, { transaction: t });
            return { newAccount, newUserProfile };
        });

        res.status(201).json({ message: 'Đăng ký thành công.', account: result.newAccount, profile: result.newUserProfile });
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// Chức năng Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const account = await Account.findOne({ where: { username: username } });
        if (!account) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        account.last_login = new Date();
        await account.save();

        const token = jwt.sign({ id: account.account_id, role: account.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            message: 'Đăng nhập thành công.',
            token,
            user: {
                account_id: account.account_id,
                username: account.username,
                role: account.role,
                last_login: account.last_login,
            },
         });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

//Làm mới token 
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        // 1. Kiểm tra refresh token có được gửi lên không
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh Token là bắt buộc.' });
        }

        // 2. Tìm tài khoản có refresh token tương ứng trong database
        const account = await Account.findOne({ where: { refresh_token: refreshToken } });
        
        if (!account) {
            // Nếu không tìm thấy, refresh token không hợp lệ hoặc đã bị vô hiệu hóa
            return res.status(401).json({ message: 'Refresh Token không hợp lệ.' });
        }
        
        // 3. Tạo một Access Token mới
        const newAccessToken = jwt.sign(
            { id: account.account_id, role: account.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        account.refresh_token = newRefreshToken;
        await account.save();

        res.status(200).json({
            message: 'Tạo Access Token mới thành công.',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Lỗi khi làm mới token:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};


