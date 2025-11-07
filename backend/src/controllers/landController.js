// landController.js
const { Op } = require('sequelize');
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
// const { createLandSchema, editLandSchema } = require('./landSchema');

const { LandParcel, Account, UserProfile } = initModels(sequelize);

// === [GET] Lấy tất cả thửa đất (Cán bộ) ===
exports.getAllLands = async (req, res) => {
  try {
    const { role, id: accountId } = req.user;

    // XÂY DỰNG ĐIỀU KIỆN LỌC
    const whereClause = {};

    if (role === 'Người dân') {
      // Người dân chỉ xem thửa đất của mình
      whereClause.owner_id = accountId;
    }

    const lands = await LandParcel.findAll({
      where: whereClause, 
      include: [
        {
          model: Account,
          as: 'owner',
          attributes: ['account_id', 'username', 'role'],
          include: [
            {
              model: UserProfile,
              as: 'UserProfile',
              attributes: ['full_name', 'phone', 'email'],
            },
          ],
        },
      ],
      order: [['parcel_code', 'ASC']],
    });

    res.status(200).json({
      message: 'Lấy danh sách thửa đất thành công.',
      count: lands.length,
      data: lands,
    });
  } catch (error) {
    console.error('Lỗi getAllLands:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// === [POST] Tạo thửa đất mới (Cán bộ) ===
exports.createLand = async (req, res) => {
  try {
    if (req.user.role !== 'Cán bộ') {
      return res.status(403).json({ message: 'Chỉ cán bộ mới được tạo thửa đất.' });
    }

    // const { error, value } = createLandSchema.validate(req.body, { abortEarly: false });
    // if (error) {
    //   return res.status(400).json({
    //     message: 'Dữ liệu không hợp lệ.',
    //     errors: error.details.map(d => d.message)
    //   });
    // }
    const value =req.body 
    const { parcel_code } = value;

    const existing = await LandParcel.findOne({ where: { parcel_code } });
    if (existing) {
      return res.status(409).json({ message: 'Mã thửa đất đã tồn tại.' });
    }

    const newLand = await LandParcel.create(value);

    res.status(201).json({
      message: 'Tạo thửa đất thành công.',
      data: newLand
    });
  } catch (error) {
    console.error('Lỗi createLand:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// === [GET] Lấy thửa đất theo ID (Cán bộ + Chủ sở hữu) ===
exports.getLandById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const land = await LandParcel.findByPk(id, {
      include: [{
        model: Account,
        as: 'owner',
        attributes: ['account_id', 'username', 'role'],
        include: [{
          model: UserProfile,
          as: 'UserProfile',
          attributes: ['full_name', 'phone', 'email']
        }]
      }]
    });

    if (!land) {
      return res.status(404).json({ message: 'Không tìm thấy thửa đất.' });
    }

    const isOwner = land.owner_id === userId;
    const isCadre = role === 'Cán bộ';

    if (!isCadre && !isOwner) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thửa đất này.' });
    }

    // Nếu là công dân, ẩn thông tin chủ sở hữu khác
    const response = isCadre ? land : {
      ...land.get({ plain: true }),
      owner: isOwner ? land.owner : null
    };

    res.status(200).json({
      message: 'Lấy thông tin thửa đất thành công.',
      data: response
    });
  } catch (error) {
    console.error('Lỗi getLandById:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// === [GET] Danh sách thửa đất của người dùng (Cán bộ + Người dân) ===
exports.getLandsByUser = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { page = 1, limit = 10, parcel_code, address } = req.query;

    const where = {};

    if (role === 'Người dân') {
      where.owner_id = userId;
    } else if (role === 'Cán bộ') {
      // Cán bộ có thể lọc theo owner_id
      if (req.query.owner_id) where.owner_id = req.query.owner_id;
    } else {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    if (parcel_code) where.parcel_code = { [Op.iLike]: `%${parcel_code}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const offset = (page - 1) * limit;

    const { count, rows } = await LandParcel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['parcel_code', 'ASC']],
      include: role === 'Cán bộ' ? [{
        model: Account,
        as: 'owner',
        attributes: ['account_id', 'username'],
        include: [{
          model: UserProfile,
          as: 'UserProfile',
          attributes: ['full_name', 'phone']
        }]
      }] : []
    });

    res.status(200).json({
      message: 'Lấy danh sách thửa đất thành công.',
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    console.error('Lỗi getLandsByUser:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// === [PATCH] Cập nhật thửa đất (Cán bộ) ===
exports.updateLand = async (req, res) => {
  try {
    if (req.user.role !== 'Cán bộ') {
      return res.status(403).json({ message: 'Chỉ cán bộ mới được cập nhật.' });
    }

    const { id } = req.params;
    // const { error, value } = editLandSchema.validate(req.body, { abortEarly: false });
    // if (error) {
    //   return res.status(400).json({
    //     message: 'Dữ liệu không hợp lệ.',
    //     errors: error.details.map(d => d.message)
    //   });
    // }
    const value=req.body;
    const land = await LandParcel.findByPk(id);
    if (!land) {
      return res.status(404).json({ message: 'Không tìm thấy thửa đất.' });
    }

    // Kiểm tra mã thửa đất trùng (nếu có thay đổi)
    if (value.parcel_code && value.parcel_code !== land.parcel_code) {
      const exists = await LandParcel.findOne({ where: { parcel_code: value.parcel_code } });
      if (exists) {
        return res.status(409).json({ message: 'Mã thửa đất đã tồn tại.' });
      }
    }

    await land.update(value);

    res.status(200).json({
      message: 'Cập nhật thửa đất thành công.',
      data: land
    });
  } catch (error) {
    console.error('Lỗi updateLand:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};