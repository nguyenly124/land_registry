const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');

// Khởi tạo models
const { LandParcel,UserProfile,Account } = initModels(sequelize);
// Hàm lấy tất cả thông tin thửa đất (chỉ dành cho cán bộ)
exports.getAllLands = async (req, res) => {
    try {
        // Kiểm tra quyền của người dùng từ token đã được xác thực
        const userRole = req.user.role;

        // Nếu người dùng không phải là cán bộ, từ chối truy cập
        if (userRole !== 'Cán bộ') {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
        }

        // Lấy tất cả thửa đất và thông tin chủ sở hữu
        const allLands = await LandParcel.findAll({
            include: [{
                model: Account,
                as: 'owner', 
                include: [{
                    model: UserProfile,
                    as: 'UserProfile',
                    attributes: ['full_name', 'email', 'phone']
                }],
                attributes: ['account_id', 'username', 'role']
            }]
        });

        res.status(200).json({
            message: 'Lấy tất cả thông tin thửa đất thành công.',
            count: allLands.length,
            data: allLands
        });

    } catch (error) {
        console.error('Lỗi khi lấy tất cả thửa đất:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// Chức năng Tạo thửa đất mới
exports.createLand = async (req, res) => {
    try {
        const userRole = req.user.role;

        // Nếu người dùng không phải là cán bộ, từ chối truy cập
        if (userRole !== 'Cán bộ') {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
        }

        const { parcel_code,
        address,
        area,
        owner_id,
        land_type,
        certificate_number,
        certificate_issue_date,
        registration_status,
        latitude,
        longitude 
    } = req.body;
        const existingLand = await LandParcel.findOne( {where: { parcel_code }});
        
        if (existingLand) {
            // Nếu đã tồn tại, trả về lỗi 409 Conflict
            return res.status(409).json({ 
                message: 'Thửa đất đã tồn tại. Vui lòng kiểm tra lại.' 
            });
        }
        const newLand = await LandParcel.create({ parcel_code,
        address,
        area,
        owner_id,
        land_type,
        certificate_number,
        certificate_issue_date,
        registration_status,
        latitude,
        longitude
     });
        res.status(201).json({ message: 'Tạo thửa đất thành công.', land: newLand });
    } catch (error) {
        console.error('Lỗi khi tạo thửa đất:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

//Lấy thông tin thửa đất theo ID 
exports.getLandById = async (req, res) => {
    try {
        const { id: landId } = req.params;
        // Lấy role và ID tài khoản đang đăng nhập từ middleware xác thực
        const { role, id: currentAccountId } = req.user; 
        
        // 1. Tải dữ liệu thửa đất, bao gồm Account của chủ sở hữu và Profile của chủ sở hữu
        const land = await LandParcel.findByPk(landId, {
            include: [{
                model: Account,
                as: 'owner', // Lấy thông tin tài khoản chủ sở hữu
                include: [{
                    model: UserProfile,
                    as: 'UserProfile', // Lấy thông tin hồ sơ (profile) chủ sở hữu
                    attributes: ['full_name', 'phone', 'email'] // Chỉ lấy các trường cần thiết
                }],
                attributes: ['account_id', 'role'] // Chỉ lấy id và role của chủ sở hữu
            }]
        });

        if (!land) {
            return res.status(404).json({ message: 'Không tìm thấy thửa đất.' });
        }

        // Chuyển đối tượng Sequelize sang Plain Object
        const landData = land.get({ plain: true }); 
        
        // 2. Xác định quyền truy cập và lọc thông tin
        let dataToReturn = {};
        
        const isCadre = role === 'Cán bộ';
        // Kiểm tra owner_id của thửa đất có trùng với ID tài khoản đang đăng nhập không
        const isOwner = landData.owner_id === currentAccountId; 

        // Trường hợp 1: Cán bộ hoặc Chủ sở hữu
        if (isCadre || isOwner) {
            // Trả về toàn bộ dữ liệu, bao gồm thông tin chi tiết về chủ sở hữu (SĐT, email)
            dataToReturn = landData;
        } 
        // Trường hợp 2: Công dân bình thường
        else {
            // Khởi tạo đối tượng trả về chỉ với các trường công khai
            dataToReturn = {
                id: landData.id,
                parcel_code: landData.parcel_code,
                address: landData.address,
                area: landData.area,
                description: landData.description,
                // Thêm thông tin chủ sở hữu (chỉ tên, không có SĐT/email)
                owner: landData.ownerAccount && landData.ownerAccount.profile ? 
                       { full_name: landData.ownerAccount.profile.full_name } : null
            };
        }

        // 3. Phản hồi thành công
        return res.status(200).json({ 
            message: 'Lấy thông tin thửa đất thành công.', 
            data: dataToReturn
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin thửa đất:', error);
        // Lỗi 500 cho các vấn đề không lường trước
        return res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// Chức năng Chỉnh sửa thông tin thửa đất
exports.editLand = async (req, res) => {
    try {
        const { id } = req.params;
        const { address, area, description, parcel_code } = req.body;
        const { role, id: userId } = req.user; // Lấy role và ID từ token

        const land = await LandParcel.findByPk(id);
        if (!land) {
            return res.status(404).json({ message: 'Không tìm thấy thửa đất.' });
        }

        // Nếu là cán bộ quản lý, cho phép chỉnh sửa toàn bộ
        if (role === 'Cán bộ') {
            await land.update({ address, area, description, parcel_code });
        }
        // Nếu là người dân, chỉ được chỉnh sửa thửa đất của chính họ
        else if (role === 'Người dân') {
            if (land.owner_id !== userId) {
                return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa thửa đất này.' });
            }
            await land.update({ address, area, description, parcel_code });
        } else {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa thửa đất.' });
        }
        
        res.status(200).json({ message: 'Cập nhật thông tin thửa đất thành công.', data: land });
    } catch (error) {
        console.error('Lỗi khi cập nhật thửa đất:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
exports.getLandsByUser = async (req, res) => {
    try {
        // Lấy thông tin người dùng đang đăng nhập
        const { role, id: currentUserId } = req.user; 
        
        // Lấy các tham số phân trang và lọc từ query (Tùy chọn)
        const { page = 1, limit = 10, parcel_code, address } = req.query; 

        // 1. Thiết lập điều kiện lọc WHERE
        const whereClause = {};
        
        // 1.1. Phân quyền và Lọc bắt buộc theo chủ sở hữu (owner_id)
        if (role === 'Cán bộ') {
            if (req.query.owner_id) {
                 whereClause.owner_id = req.query.owner_id;
            }
        } else if (role === 'Người dân') {
            // Người dân chỉ được phép xem thửa đất của chính họ
            whereClause.owner_id = currentUserId;
        } else {
            // Các vai trò không được phép
            return res.status(403).json({ message: 'Bạn không có quyền truy cập danh sách thửa đất.' });
        }

        if (parcel_code) {
            whereClause.parcel_code = { [Op.iLike]: `%${parcel_code}%` };
        }
        if (address) {
            whereClause.address = { [Op.iLike]: `%${address}%` };
        }
        
        // 2. Tính toán Phân trang
        const offset = (page - 1) * limit;

        // 3. Thực hiện truy vấn
        const { count, rows } = await LandParcel.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            //order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo mới nhất

            // Bao gồm thông tin chủ sở hữu (cho Cán bộ)
            include: [{
                model: Account,
                as: 'owner',
                attributes: ['account_id', 'username', 'role'],
                include: [{
                    model: UserProfile,
                    as: 'UserProfile',
                    attributes: ['full_name', 'phone']
                }]
            }]
        });

        // 4. Phản hồi thành công
        return res.status(200).json({
            message: 'Lấy danh sách thửa đất thành công.',
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            items: rows
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách thửa đất:', error);
        return res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};
// // Chức năng Tìm kiếm thửa đất
// exports.searchLands = async (req, res) => {
//     try {
//         const { owner_id, parcel_code, address, area, page, limit } = req.query;
//         const { role, id: userId } = req.user; // Lấy role và ID từ token

//         const whereClause = {};

//         // Chỉ cho phép tìm kiếm theo owner_id nếu là Cán bộ
//         if (role === 'Cán bộ' && owner_id) {
//             whereClause.owner_id = owner_id;
//         } 
//         // Nếu là Người dân, chỉ được tìm kiếm các thửa đất của chính họ
//         else if (role === 'Người dân') {
//             whereClause.owner_id = userId;
//         } else {
//             // Nếu không có role phù hợp, trả về lỗi
//             return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
//         }

//         if (parcel_code) {
//             whereClause.parcel_code = { [Op.iLike]: `%${parcel_code}%` };
//         }
//         if (address) {
//             whereClause.address = { [Op.iLike]: `%${address}%` };
//         }
//         if (area) {
//             whereClause.area = { [Op.eq]: area };
//         }
        
//         const offset = (page - 1) * limit;

//         const { count, rows } = await LandParcel.findAndCountAll({
//             where: whereClause,
//             limit: limit,
//             offset: offset,
//             order: [['parcel_code', 'ASC']],
//             include: [{
//                 model: Account,
//                 as: 'owner',
//                 attributes: ['username', 'role'],
//                 include: [{
//                     model: UserProfile,
//                     as: 'UserProfiles',
//                     attributes: ['full_name', 'phone']
//                 }]
//             }]
//         });

//         res.status(200).json({
//             message: 'Tìm kiếm thửa đất thành công.',
//             totalItems: count,
//             totalPages: Math.ceil(count / limit),
//             currentPage: page,
//             items: rows
//         });
//     } catch (error) {
//         console.error('Lỗi khi tìm kiếm thửa đất:', error);
//         res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
//     }
// };