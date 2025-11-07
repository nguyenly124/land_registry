const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/dossiers/' });
const { HoSoDocument, HoSo } = initModels(sequelize);

// --- Hàm thêm tài liệu vào hồ sơ ---
exports.uploadDocument = async (req, res) => {
    try {
      const { hoso_id } = req.body;
      const files = req.files; 
      const { id: userId, role } = req.user;

      if (!hoso_id) {
        return res.status(400).json({ message: 'Thiếu hoso_id.' });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 file.' });
      }

      const hoso = await HoSo.findByPk(hoso_id);
      if (!hoso) {
        return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
      }

      if (role === 'Người dân' && hoso.account_id !== userId) {
        return res.status(403).json({ message: 'Bạn không có quyền thêm tài liệu vào hồ sơ này.' });
      }

      // TẠO NHIỀU BẢN GHI
      const documents = await Promise.all(
        files.map(file =>
          HoSoDocument.create({
            hoso_id,
            doc_name: file.originalname,
            file_path: file.path,
            cloudinary_id: file.filename
          })
        )
      );

      res.status(201).json({
        message: 'Tải tài liệu lên thành công.',
        data: documents
      });

    } catch (error) {
      console.error('Lỗi khi tải tài liệu lên:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
  };

// --- Hàm lấy danh sách tài liệu của một hồ sơ ---
exports.getDocumentsByHoSoId = async (req, res) => {
    try {
        const { hoso_id } = req.params;
        const { id: userId, role } = req.user;

        const hoso = await HoSo.findByPk(hoso_id);
        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }

        // Phân quyền: Cán bộ xem tất cả, người dân chỉ xem hồ sơ của mình
        if (role === 'Người dân' && hoso.account_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem tài liệu của hồ sơ này.' });
        }

        const documents = await HoSoDocument.findAll({
            where: { hoso_id: hoso_id },
            order: [['uploaded_at', 'ASC']]
        });

        res.status(200).json({
            message: 'Lấy danh sách tài liệu thành công.',
            count: documents.length,
            hoso: documents
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách tài liệu:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
exports.getDocumentById = async (req, res) => {
  try {
    const { doc_id } = req.params;
    const { id: userId, role } = req.user;

    // Tìm file theo ID, đồng thời lấy thông tin hồ sơ để check quyền
    const document = await HoSoDocument.findByPk(doc_id, {
      include: [{ model: HoSo, attributes: ['account_id'] }]
    });

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    }

    // Người dân chỉ xem được tài liệu của chính hồ sơ mình nộp
    if (role === 'Người dân' && document.HoSo.account_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem tài liệu này.' });
    }

    res.status(200).json({
      message: 'Lấy thông tin tài liệu thành công.',
      data: document
    });

  } catch (error) {
    console.error('Lỗi khi lấy tài liệu:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
  }
};
// --- Hàm xóa một tài liệu ---
exports.deleteDocument = async (req, res) => {
  try {
    const { doc_id } = req.params;
    const { id: userId, role } = req.user;

    const document = await HoSoDocument.findByPk(doc_id, {
      include: [{ model: HoSo, as: 'hoso' }]
    });

    if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });

    const hoso = document.hoso;
    if (role === 'Người dân' && hoso.account_id !== userId) {
      return res.status(403).json({ message: 'Không có quyền.' });
    }

    // XÓA TRÊN CLOUDINARY
    if (document.cloudinary_id) {
      await cloudinary.uploader.destroy(document.cloudinary_id);
    }

    await document.destroy();

    res.status(200).json({ message: 'Xóa tài liệu thành công.' });

  } catch (error) {
    console.error('Lỗi xóa tài liệu:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};