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
  let t;
  const io = req.app.get('io');
  try {
    t = await sequelize.transaction();

    // 1. LẤY ĐẦY ĐỦ DỮ LIỆU
    const { type, parcelId, receiver_info } = req.body;
    const { id: accountId, role } = req.user;

    // 2. VALIDATE LOẠI HỒ SƠ
    if (!type || !['Đăng ký sử dụng', 'Chuyển nhượng'].includes(type)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Loại hồ sơ không hợp lệ.' });
    }

    // 3. KIỂM TRA THỬA ĐẤT (nếu có)
    let finalParcelId = null;
    if (parcelId) {
      const parcel = await LandParcel.findByPk(parcelId, { transaction: t });
      if (!parcel) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy thửa đất.' });
      }

      // KIỂM TRA QUYỀN (nếu cần)
      // if (role === 'Người dân' && parcel.owner_id !== accountId) {
      //   await t.rollback();
      //   return res.status(403).json({ success: false, message: 'Bạn không phải chủ sở hữu thửa đất này.' });
      // }
      finalParcelId = parcelId;
    }

    // 4. VALIDATE CHUYỂN NHƯỢNG
    if (type === 'Chuyển nhượng') {
      if (!receiver_info ||
          !receiver_info.full_name?.trim() ||
          !receiver_info.id_number?.trim() ||
          !receiver_info.phone?.trim() ||
          !receiver_info.address?.trim()) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin người nhận chuyển nhượng.' });
      }
    }

    // 5. TẠO HỒ SƠ
    const newHoSo = await HoSo.create({
      account_id: accountId,
      parcel_id: finalParcelId,
      type: type.trim(),
      status: 'Chờ xử lý',
      receiver_info: type === 'Chuyển nhượng' ? receiver_info : null
    }, { transaction: t });

    // 6. GHI LỊCH SỬ
    await logHistory(
      newHoSo.hoso_id,
      null,
      'Chờ xử lý',
      'Nộp hồ sơ mới',
      accountId,
      `Loại: ${type} | Thửa: ${finalParcelId || 'Không có'}`,
      t
    );

    await t.commit();

    // 7. GỬI THÔNG BÁO
    emit('hoso.submitted', {
      io,
      accountId,
      type: newHoSo.type,
      hosoId: newHoSo.hoso_id,
      parcelId: newHoSo.parcel_id
    });

    res.status(201).json({
      success: true,
      message: 'Nộp hồ sơ thành công.',
      data: newHoSo
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error('Lỗi nộp hồ sơ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ===  Cán bộ xác nhận xử lý hồ sơ ===
exports.confirmProcessing = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { hoso_id } = req.params;
    const actor_id = req.user.id;

    const hoso = await HoSo.findByPk(hoso_id, { transaction: t });
    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ message: 'Hồ sơ không tồn tại.' });
    }

    if (hoso.status !== 'Chờ xử lý') {
      await t.rollback();
      return res.status(400).json({ message: 'Hồ sơ không ở trạng thái chờ xử lý.' });
    }

    const oldStatus = hoso.status;
    await hoso.update({ status: 'Đang xử lý' }, { transaction: t });

    await logHistory(hoso_id, oldStatus, 'Đang xử lý', 'Xác nhận xử lý', actor_id, null, t);

    await t.commit();
    res.status(200).json({ success: true, message: 'Xác nhận xử lý thành công.' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi xác nhận xử lý:', error);
    res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra.' });
  }
};

// ===  Yêu cầu bổ sung tài liệu ===
exports.requestSupplement = async (req, res) => {
  let t;
  const io = req.app.get('io');
  try {
    t = await sequelize.transaction();
    const { hosoId } = req.params;
    const { reason } = req.body;
    const actor_id = req.user.id;
    const { role } = req.user;

    if (role !== 'Cán bộ') {
      await t.rollback();
      return res.status(403).json({ message: 'Chỉ cán bộ mới được yêu cầu bổ sung.' });
    }

    if (!reason?.trim()) {
      await t.rollback();
      return res.status(400).json({ message: 'Vui lòng nhập nội dung yêu cầu bổ sung.' });
    }

    const hoso = await HoSo.findByPk(hosoId, { transaction: t });
    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    }

    if (!['Chờ xử lý', 'Đang xử lý'].includes(hoso.status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Chỉ yêu cầu bổ sung khi hồ sơ đang chờ hoặc đang xử lý.' });
    }

    const oldStatus = hoso.status;
    await hoso.update({
      status: 'Đang xử lý',
      supplement_note: reason.trim(),
      updated_at: new Date()
    }, { transaction: t });

    await logHistory(hosoId, oldStatus, 'Đang xử lý', 'Yêu cầu bổ sung tài liệu', actor_id, reason.trim(), t);

    await t.commit();

    emit('hoso.supplement_requested', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id,
      reason: reason.trim()
    });

    res.status(200).json({
      success: true,
      message: 'Yêu cầu bổ sung đã được gửi thành công.',
      data: { hoso_id: hoso.hoso_id, supplement_note: hoso.supplement_note }
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error('Lỗi yêu cầu bổ sung:', error);
    res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra.' });
  }
};

// ===  Duyệt hồ sơ ===
exports.approveHoSo = async (req, res) => {
  let t;
  const io = req.app.get('io');
  try {
    t = await sequelize.transaction();
    const { hosoId } = req.params;
    const { note } = req.body;
    const actor_id = req.user.id;

    // 1. TÌM HỒ SƠ
    const hoso = await HoSo.findByPk(hosoId, {
      include: [
        { model: LandParcel, as: 'parcel' },
        { model: Account, as: 'account', include: [UserProfile] }
      ],
      transaction: t
    });

    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Hồ sơ không tồn tại.' });
    }

    if (!['Chờ xử lý', 'Đang xử lý'].includes(hoso.status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Hồ sơ không thể duyệt ở trạng thái hiện tại.' });
    }

    const oldStatus = hoso.status;
    let certificateNumber = null;
    let newOwnerId = null;

    // === XỬ LÝ THEO LOẠI HỒ SƠ ===
    if (hoso.type === 'Chuyển nhượng' && hoso.receiver_info) {
      // === CHUYỂN NHƯỢNG ===
      const { full_name, id_number, phone, address, email } = hoso.receiver_info;

      if (!full_name || !id_number || !phone || !address) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Thông tin người nhận không đầy đủ.' });
      }

      // Tìm hoặc tạo tài khoản người nhận
      let receiverAccount = await Account.findOne({ where: { username: id_number }, transaction: t });
      if (!receiverAccount) {
        receiverAccount = await Account.create({
          username: id_number,
          password: await bcrypt.hash(id_number, 10),
          role: 'Người dân'
        }, { transaction: t });

        await UserProfile.create({
          account_id: receiverAccount.account_id,
          full_name,
          phone,
          email: email || null
        }, { transaction: t });
      }

      newOwnerId = receiverAccount.account_id;
      certificateNumber = `GCN-${hosoId}-${Date.now().toString().slice(-6)}`;

      await logHistory(
        hosoId,
        oldStatus,
        'Đã duyệt',
        'Chuyển nhượng thành công',
        actor_id,
        `→ Chủ mới: ${full_name} (CMND: ${id_number})\nGCN: ${certificateNumber}`,
        t
      );

    } else if (hoso.type === 'Đăng ký sử dụng') {
      // === ĐĂNG KÝ SỬ DỤNG ===
      newOwnerId = hoso.account_id; 
      certificateNumber = `GCN-${hosoId}-${Date.now().toString().slice(-6)}`;

      await logHistory(
        hosoId,
        oldStatus,
        'Đã duyệt',
        'Cấp GCN quyền sử dụng đất',
        actor_id,
        `Chủ sở hữu: ${hoso.account.UserProfile.full_name}\nGCN: ${certificateNumber}`,
        t
      );
    }
    if (hoso.parcel_id && newOwnerId) {
      await LandParcel.update(
        { owner_id: newOwnerId },
        { where: { parcel_id: hoso.parcel_id }, transaction: t }
      );
    }
    await hoso.update({ status: 'Đã duyệt' }, { transaction: t });
    emit('hoso.approved', {
      io,
      accountId: hoso.account_id,
      hosoId: hoso.hoso_id
    });

    // Nếu là chuyển nhượng → gửi thêm cho người nhận
    if (hoso.type === 'Chuyển nhượng' && hoso.receiver_info?.id_number) {
      const receiverAcc = await Account.findOne({ where: { username: hoso.receiver_info.id_number }, transaction: t });
      if (receiverAcc) {
        emit('hoso.approved', {
          io,
          accountId: receiverAcc.account_id,
          hosoId: hoso.hoso_id
        });
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Duyệt hồ sơ thành công.',
      data: {
        hoso_id: hoso.hoso_id,
        type: hoso.type,
        certificate_number: certificateNumber,
        new_owner_id: newOwnerId
      }
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error('Lỗi duyệt hồ sơ:', error);
    res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra.' });
  }
};

// ===  Từ chối hồ sơ ===
exports.rejectHoSo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { hosoId } = req.params;
    const { reason  } = req.body;
    const actor_id = req.user.id;

    if (!reason ?.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    const hoso = await HoSo.findByPk(hosoId, { transaction: t });
    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ message: 'Hồ sơ không tồn tại.' });
    }

    if (!['Chờ xử lý', 'Đang xử lý'].includes(hoso.status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Hồ sơ không thể từ chối ở trạng thái hiện tại.' });
    }

    const oldStatus = hoso.status;
    await hoso.update({ status: 'Từ chối' }, { transaction: t });

    // GHI LỊCH SỬ
    await logHistory(
      hosoId,
      oldStatus,
      'Từ chối',
      'Từ chối hồ sơ',
      actor_id,
      reason ,
      t
    );

    await t.commit();
    res.status(200).json({ message: 'Từ chối hồ sơ thành công.' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi từ chối hồ sơ:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
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
  const t = await sequelize.transaction();
  try {
    const { hoso_id } = req.params;
    const { note } = req.body;
    const { id: actor_id, role } = req.user;

    const hoso = await HoSo.findByPk(hoso_id, {
      include: [{ model: Account, attributes: ['role'] }],
      transaction: t
    });

    if (!hoso) {
      await t.rollback();
      return res.status(404).json({ message: 'Hồ sơ không tồn tại.' });
    }

    // Kiểm tra quyền hủy
    if (role === 'Người dân' && hoso.account_id !== actor_id) {
      await t.rollback();
      return res.status(403).json({ message: 'Bạn không có quyền hủy hồ sơ này.' });
    }

    if (!['Chờ xử lý', 'Đang xử lý'].includes(hoso.status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Chỉ có thể hủy hồ sơ ở trạng thái chờ hoặc đang xử lý.' });
    }

    const oldStatus = hoso.status;
    await hoso.update({ status: 'Từ chối' }, { transaction: t });

    // GHI LỊCH SỬ
    await logHistory(
      hoso_id,
      oldStatus,
      'Đã hủy',
      'Hủy hồ sơ',
      actor_id,
      note || 'Người dùng yêu cầu hủy hồ sơ.',
      t
    );

    await t.commit();
    res.status(200).json({ message: 'Hủy hồ sơ thành công.' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi hủy hồ sơ:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
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