const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');

// Khởi tạo models
const { HoSo, HoSoDocument,LandParcel, UserProfile, Account } = initModels(sequelize);

// Chức năng Nộp hồ sơ mới
exports.submitHoSo = async (req, res) => {
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

        res.status(201).json({
            message: 'Nộp hồ sơ thành công.',
            hoso: newHoSo
        });

    } catch (error) {
        console.error('Lỗi khi nộp hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// Chức năng Duyệt hồ sơ (cho Cán bộ)
exports.approveHoSo = async (req, res) => {
    try {
        const { hosoId, action } = req.body;

        const hoso = await HoSo.findByPk(hosoId);
        if (!hoso) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
        }

        if (hoso.status !== 'Chờ xử lý' && hoso.status !== 'Đang xử lý') {
            return res.status(400).json({ message: 'Hồ sơ này không thể xử lý.' });
        }

        await hoso.update({ status: action, updated_at: new Date() });
        res.status(200).json({ message: `Hồ sơ đã được cập nhật trạng thái: ${action}.`, hoso });
    } catch (error) {
        console.error('Lỗi khi duyệt hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
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

        // Chỉ cho phép chỉnh sửa nếu hồ sơ đang ở trạng thái 'Chờ xử lý'
        if (hoso.status !== 'Chờ xử lý') {
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
        const { role, id: userId } = req.user; // Lấy role và ID từ token đã xác thực

        // Khởi tạo điều kiện tìm kiếm
        const whereClause = {};

        // 1. Phân quyền hiển thị
        // Chỉ cán bộ mới được lấy tất cả hồ sơ, nếu không sẽ bị giới hạn
        if (role !== 'Cán bộ') {
            // Nếu không phải cán bộ, chỉ được xem hồ sơ của chính mình
            whereClause.account_id = userId;
        }

        // 2. Thực hiện truy vấn
        const allHoSo = await HoSo.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']], // Sắp xếp theo ngày tạo mới nhất
            include: [
                {
                    model: Account,
                    as: 'account', // Alias đã định nghĩa trong init-models.js
                    attributes: ['username', 'role'],
                    include: [{
                        model: UserProfile,
                        as: 'user_profile',
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
            message: 'Lấy danh sách hồ sơ thành công.',
            count: allHoSo.length,
            data: allHoSo
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách hồ sơ:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
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
                    as: 'ho_so_documents', // Alias đã định nghĩa trong init-models.js
                    attributes: ['doc_id', 'doc_name', 'file_path', 'uploaded_at']
                },
                {
                    model: Account,
                    as: 'account',
                    attributes: ['username', 'role'],
                    include: [{
                        model: UserProfile,
                        as: 'user_profile',
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
                        as: 'user_profile',
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