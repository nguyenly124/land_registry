const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { emit } = require('../utils/NotificationEvent');
// Khởi tạo models
const { HoSo, HoSoDocument,LandParcel, UserProfile, Account, HoSoHistory } = initModels(sequelize);

const logHistory = async (hoso_id, old_status, new_status, action, actor_id, note = null, t = null) => {
  await HoSoHistory.create({
    hoso_id,
    old_status,
    new_status,
    action,
    actor_id,
    note,
    created_at: new Date()
  }, { transaction: t });
};
// Chức năng Nộp hồ sơ mới
exports.submitHoSo = async (req, res) => {
    const io = req.app.get('io');
    try {
        const { type, parcelId } = req.body;
        const { id: accountId, role } = req.user; 

        // Nếu có parcelId thì kiểm tra xem thửa đất tồn tại không
        let parcel = null;
        if (parcelId) {
            parcel = await LandParcel.findByPk(parcelId);
            if (!parcel) {
                return res.status(404).json({ message: 'Không tìm thấy thửa đất.' });
            }

            // Nếu người dân nộp hồ sơ thì phải là chủ sở hữu thửa đất đó
            if (role === 'Người dân' && parcel.owner_id !== accountId) {
                return res.status(403).json({ message: 'Bạn không có quyền nộp hồ sơ cho thửa đất này.' });
            }
        }

        // Tạo mới hồ sơ
        const newHoSo = await HoSo.create({
            account_id: accountId,
            parcel_id: parcelId || null,
            type: type.trim(),
            status: 'Chờ xử lý'
        });
        emit('hoso.submitted', {
        io,
        accountId,
        type: newHoSo.type,
        hosoId: newHoSo.hoso_id,
        parcelId: newHoSo.parcel_id
        });
        res.status(201).json({
            message: 'Nộp hồ sơ thành công.',
            data: newHoSo
        });

    } catch (error) {
        console.error('Lỗi khi nộp hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// ===  Cán bộ xác nhận xử lý hồ sơ ===
exports.confirmProcessing = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { hosoId } = req.params;
    const canBoId = req.user.id;

    if (req.user.role !== 'Cán bộ') {
      return res.status(403).json({ message: 'Chỉ cán bộ mới được xác nhận xử lý.' });
    }

    const hoso = await HoSo.findByPk(hosoId);
    if (!hoso) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    if (hoso.status !== 'Chờ xử lý') {
      return res.status(400).json({ message: 'Hồ sơ không ở trạng thái chờ xử lý.' });
    }

    await hoso.update({
      status: 'Đang xử lý',
      assigned_to: canBoId,
      updated_at: new Date()
    });

    // Gửi thông báo
    emit('hoso.processing', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id,
      canBoId
    });

    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã được xác nhận xử lý.',
      data: hoso
    });
  } catch (error) {
    console.error('Lỗi xác nhận xử lý:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ===  Yêu cầu bổ sung tài liệu ===
exports.requestSupplement = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { hosoId } = req.params;
    const { note } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung yêu cầu bổ sung.' });
    }

    const hoso = await HoSo.findByPk(hosoId);
    if (!hoso) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });

    await hoso.update({
      status: 'Đang xử lý',
      supplement_note: note.trim(),
      updated_at: new Date()
    });

    emit('hoso.supplement_requested', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id,
      note
    });

    res.status(200).json({
      success: true,
      message: 'Yêu cầu bổ sung đã được gửi.',
      data: hoso
    });
  } catch (error) {
    console.error('Lỗi yêu cầu bổ sung:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ===  Duyệt hồ sơ ===
exports.approveHoSo = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { hosoId } = req.params;

    const hoso = await HoSo.findByPk(hosoId);
    if (!hoso) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    if (!['Chờ xử lý','Đang xử lý'].includes(hoso.status)) {
      return res.status(400).json({ message: 'Hồ sơ không thể duyệt.' });
    }

    await hoso.update({
      status: 'Đã duyệt',
      processed_by: req.user.id,
      processed_at: new Date()
    });

    emit('hoso.approved', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id
    });

    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã được duyệt thành công!',
      data: hoso
    });
  } catch (error) {
    console.error('Lỗi duyệt hồ sơ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ===  Từ chối hồ sơ ===
exports.rejectHoSo = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { hosoId } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập lý do từ chối.' });
    }

    const hoso = await HoSo.findByPk(hosoId);
    if (!hoso) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });

    await hoso.update({
      status: 'Từ chối',
      reject_reason: reason.trim(),
      processed_by: req.user.id,
      processed_at: new Date()
    });

    emit('hoso.rejected', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã bị từ chối.',
      data: hoso
    });
  } catch (error) {
    console.error('Lỗi từ chối hồ sơ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// Chức năng Chỉnh sửa hồ sơ
exports.editHoSo = async (req, res) => {
    try {
        const { hosoId, ...updatedData } = req.body;
        const hoso = await HoSo.findByPk(hosoId);

        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }
        if (hoso.status !== 'Chờ xử lý' && hoso.status !== 'Đang xử lý') {
            return res.status(403).json({ message: 'Không thể chỉnh sửa hồ sơ ở trạng thái này.' });
        }

        await hoso.update(updatedData);
        res.status(200).json({ message: 'Chỉnh sửa hồ sơ thành công.', hoso });
    } catch (error) {
        console.error('Lỗi khi chỉnh sửa hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// Chức năng Yêu cầu hủy hồ sơ
exports.cancelHoSo = async (req, res) => {
    try {
        const { hosoId } = req.body;
        const hoso = await HoSo.findByPk(hosoId);

        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }

        if (hoso.status !== 'Chờ xử lý') {
            return res.status(403).json({ message: 'Không thể hủy hồ sơ ở trạng thái này.' });
        }

        await hoso.update({ status: 'Từ chối', updated_at: new Date() });
        res.status(200).json({ message: 'Hồ sơ đã được hủy thành công.', hoso });
    } catch (error) {
        console.error('Lỗi khi hủy hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// Hàm lấy tất cả hồ sơ
exports.getAllHoSo = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    // === 1. Lấy query params ===
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Giới hạn max 100
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    // === 2. Xây dựng điều kiện WHERE ===
    const whereClause = {};

    // Phân quyền: chỉ cán bộ xem tất cả, người dân chỉ xem của mình
    if (role !== 'Cán bộ') {
      whereClause.account_id = userId;
    }

    // Lọc theo trạng thái
    if (status && ['Chờ xử lý', 'Đang xử lý', 'Đã duyệt', 'Từ chối'].includes(status)) {
      whereClause.status = status;
    }

    // Tìm kiếm đa trường
    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { hoso_id: { [Op.like]: keyword } },
        { type: { [Op.like]: keyword } },
        { '$account.username$': { [Op.like]: keyword } },
        { '$account.UserProfile.full_name$': { [Op.like]: keyword } },
        { '$parcel.parcel_code$': { [Op.like]: keyword } },
        { '$parcel.address$': { [Op.like]: keyword } }
      ];
    }

    // === 3. Truy vấn với phân trang ===
    const { count, rows } = await HoSo.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['account_id', 'username', 'role'],
          include: [
            {
              model: UserProfile,
              as: 'UserProfile',
              attributes: ['full_name', 'phone', 'email']
            }
          ]
        },
        {
          model: LandParcel,
          as: 'parcel',
          attributes: ['parcel_id', 'parcel_code', 'address', 'area']
        }
      ],
      distinct: true, // Đảm bảo count chính xác khi có include
      subQuery: false // Tối ưu truy vấn
    });

    // === 4. Tính toán phân trang ===
    const totalPages = Math.ceil(count / limit);

    // === 5. Trả về response chuẩn ===
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hồ sơ thành công.',
      data: rows,
      count,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách hồ sơ:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
//laays chi tiết hồ sơ 
exports.getHoSoDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const hoso = await HoSo.findByPk(id, {
            include: [
                {
                    model: HoSoDocument,
                    as: 'HoSoDocuments', // Alias đã định nghĩa trong init-models.js
                    attributes: ['doc_id', 'doc_name', 'file_path', 'uploaded_at']
                },
                {
                    model: Account,
                    as: 'account',
                    attributes: ['username', 'role'],
                    include: [{
                        model: UserProfile,
                        as: 'UserProfile',
                        attributes: ['full_name', 'phone', 'email']
                    }]
                },
                {
                    model: LandParcel,
                    as: 'parcel',
                    attributes: ['parcel_code', 'address', 'area']
                }
            ]
        });

        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }
        
        // Phân quyền: Cán bộ có thể xem bất kỳ hồ sơ nào
        // Người dân chỉ được xem hồ sơ của chính họ
        if (role === 'Người dân' && hoso.account_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này.' });
        }

        res.status(200).json({
            message: 'Lấy thông tin chi tiết hồ sơ thành công.',
            data: hoso
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin chi tiết hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// Tìm kiếm hồ sơ 
exports.searchHoSo = async (req, res) => {
    try {
        const {
            query, page, limit, status, account_id, parcel_id
        } = req.query;
        
        const { role, id: userId } = req.user;

        const whereClause = {};

        // Phân quyền: Cán bộ có quyền tìm kiếm không giới hạn
        // Công dân chỉ tìm kiếm hồ sơ của chính họ
        if (role === 'Người dân') {
            whereClause.account_id = userId;
        }

        // Thêm các điều kiện tìm kiếm từ query
        if (status) {
            whereClause.status = status;
        }
        if (account_id) {
            // Cán bộ có quyền tìm kiếm theo account_id của người khác
            if (role === 'Cán bộ') {
                whereClause.account_id = account_id;
            } else {
                // Người dân chỉ có thể tìm hồ sơ của chính họ
                return res.status(403).json({ message: 'Bạn không có quyền tìm kiếm hồ sơ của người khác.' });
            }
        }
        if (parcel_id) {
            whereClause.parcel_id = parcel_id;
        }
        
        // Thêm điều kiện tìm kiếm chung (query)
        if (query) {
            whereClause[Op.or] = [
                { type: { [Op.iLike]: `%${query}%` } },
                { '$account.user_profile.full_name$': { [Op.iLike]: `%${query}%` } },
                { '$account.user_profile.email$': { [Op.iLike]: `%${query}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HoSo.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Account,
                    as: 'account',
                    attributes: ['username', 'role'],
                    include: [{
                        model: UserProfile,
                        as: 'UserProfile',
                        attributes: ['full_name', 'phone', 'email']
                    }]
                },
                {
                    model: LandParcel,
                    as: 'parcel',
                    attributes: ['parcel_code', 'address']
                }
            ]
        });

        res.status(200).json({
            message: 'Tìm kiếm hồ sơ thành công.',
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            items: rows
        });

    } catch (error) {
        console.error('Lỗi khi tìm kiếm hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};