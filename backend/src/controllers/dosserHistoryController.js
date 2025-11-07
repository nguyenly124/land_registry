// src/controllers/hosoHistoryController.js
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Khởi tạo models
const { HoSo, HoSoHistory, Account, UserProfile } = initModels(sequelize);

exports.createHistory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { hoso_id, old_status, new_status, action, note } = req.body;
    const actor_id = req.user.id;

    // Kiểm tra hồ sơ tồn tại
    const hoso = await HoSo.findByPk(hoso_id, { transaction: t });
    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    }

    // Tạo bản ghi lịch sử
    const history = await HoSoHistory.create({
      hoso_id,
      old_status,
      new_status,
      action,
      actor_id,
      note,
      created_at: new Date()
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Ghi lịch sử thành công.',
      data: history
    });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi ghi lịch sử:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
  }
};

exports.getHistoryByHosoId = async (req, res) => {
  try {
    const { hoso_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Kiểm tra quyền (người dân chỉ xem hồ sơ của mình)
    const hoso = await HoSo.findByPk(hoso_id, {
      attributes: ["account_id"],
      include: [
        {
          model: Account,
          as: "account",  
          attributes: ["role"]
        }
      ]
    });

    if (!hoso) {
      return res.status(404).json({ message: 'Hồ sơ không tồn tại.' });
    }

    if (req.user.role === 'Người dân' && hoso.account_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem lịch sử hồ sơ này.' });
    }

    const { count, rows } = await HoSoHistory.findAndCountAll({
      where: { hoso_id },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Account,
          as: 'actor',
          attributes: ['username'],
          include: [
            {
              model: UserProfile,
              as: 'UserProfile',
              attributes: ['full_name']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      message: 'Lấy lịch sử thành công.',
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });

  } catch (error) {
    console.error('Lỗi lấy lịch sử:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
  }
};

exports.deleteHistory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { history_id } = req.params;

    const history = await HoSoHistory.findByPk(history_id, { transaction: t });
    if (!history) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy bản ghi lịch sử.' });
    }

    await history.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ message: 'Xóa lịch sử thành công.' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi xóa lịch sử:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
  }
};