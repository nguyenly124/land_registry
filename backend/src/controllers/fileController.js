const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const path = require('path');
const fs = require('fs');

const { HoSoDocument, HoSo } = initModels(sequelize);

// --- Hàm thêm tài liệu vào hồ sơ ---
exports.uploadDocument = async (req, res) => {
    try {
        const { hoso_id } = req.body;
        const { id: userId, role } = req.user;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file để tải lên.' });
        }

        const hoso = await HoSo.findByPk(hoso_id);

        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }
        
        // Phân quyền: Cán bộ có thể thêm tài liệu vào bất kỳ hồ sơ nào
        // Người dân chỉ được thêm tài liệu vào hồ sơ của chính họ
        if (role === 'Người dân' && hoso.account_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền thêm tài liệu vào hồ sơ này.' });
        }

        // Tạo bản ghi mới trong database
        const newDocument = await HoSoDocument.create({
            hoso_id: hoso_id,
            doc_name: file.originalname,
            file_path: file.path // Lưu đường dẫn tạm thời của file
        });

        res.status(201).json({
            message: 'Tải tài liệu lên thành công.',
            data: newDocument
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
            data: documents
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
            include: [{
                model: HoSo,
                as: 'hoso'
            }]
        });

        if (!document) {
            return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
        }
        
        const hoso = document.hoso;

        // Phân quyền: Chỉ cán bộ hoặc người tạo hồ sơ mới có quyền xóa
        if (role === 'Người dân' && hoso.account_id !== userId) {
             return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu này.' });
        }

        // Xóa file vật lý khỏi server
        fs.unlink(document.file_path, (err) => {
            if (err) console.error('Lỗi khi xóa file vật lý:', err);
        });

        // Xóa bản ghi trong database
        await document.destroy();

        res.status(200).json({ message: 'Xóa tài liệu thành công.' });

    } catch (error) {
        console.error('Lỗi khi xóa tài liệu:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};